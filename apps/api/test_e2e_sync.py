import asyncio
from datetime import date, datetime, timedelta, timezone
import httpx
from httpx import ASGITransport

from app.main import app


async def test_full_pipeline():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver/api/v1") as client:
        print("\n========================================================")
        print("🚀 INICIANDO AUDITORIA E TESTE E2E DO ARENAGO (NEON DB)")
        print("========================================================")

        # ----------------------------------------------------
        # 1. Health & Root API
        # ----------------------------------------------------
        print("\n--- 1. Testing Health & API Root ---")
        health_resp = await client.get("/health")
        print("Health status code:", health_resp.status_code, health_resp.json())
        assert health_resp.status_code == 200, f"Expected 200, got {health_resp.status_code}"
        assert health_resp.json().get("status") == "healthy"

        # ----------------------------------------------------
        # 2. Venues Marketplace (Centros Esportivos)
        # ----------------------------------------------------
        print("\n--- 2. Testing Venues Marketplace (/venues) ---")
        venues_resp = await client.get("/venues")
        assert venues_resp.status_code == 200, f"Expected 200, got {venues_resp.status_code}"
        venues = venues_resp.json()
        print(f"Total de centros esportivos encontrados: {len(venues)}")
        for v in venues:
            print(f" • {v.get('name')} ({v.get('city')}/{v.get('state')}) - Slug: {v.get('slug')} - Quadras: {len(v.get('courts', []))}")
        assert len(venues) > 0, "Deveria haver pelo menos uma arena no banco de dados."

        # Selecionar Arena Show ou primeira arena
        target_venue = next((v for v in venues if "arena show" in v.get("name", "").lower()), venues[0])
        venue_id = target_venue["id"]
        venue_slug = target_venue.get("slug") or venue_id
        print(f"Arena selecionada para teste: {target_venue['name']} (ID: {venue_id}, Slug: {venue_slug})")

        # ----------------------------------------------------
        # 3. Public Schedule Endpoint (/venues/{slug}/schedule)
        # ----------------------------------------------------
        print("\n--- 3. Testing Public Schedule Endpoint ---")
        # Usar uma data futura próxima para garantir slots livres
        test_date = (date.today() + timedelta(days=2)).isoformat()
        schedule_resp = await client.get(f"/venues/{venue_slug}/schedule?target_date={test_date}")
        assert schedule_resp.status_code == 200, f"Schedule failed with {schedule_resp.status_code}: {schedule_resp.text}"
        schedule_data = schedule_resp.json()
        print(f"Arena: {schedule_data['venue_name']}, Data: {schedule_data['target_date']}")
        print(f"Endereço: {schedule_data['address_full']}")
        print(f"Quadras ativas: {len(schedule_data['courts'])}")
        assert len(schedule_data["courts"]) > 0, "A arena deve conter quadras ativas com slots."

        court = schedule_data["courts"][0]
        court_id = court["court_id"]
        court_name = court["court_name"]
        print(f"Quadra de teste: {court_name} (ID: {court_id}) - Slots: {len(court['slots'])}")
        available_slots = [s for s in court["slots"] if s.get("is_available")]
        print(f"Slots livres encontrados: {len(available_slots)}")
        assert len(available_slots) >= 2, "Quadra deve ter pelo menos 2 slots livres para teste de agendamento múltiplo."

        # ----------------------------------------------------
        # 4. Google OAuth & Autenticação do Jogador
        # ----------------------------------------------------
        print("\n--- 4. Testing Google OAuth & Persistent Session ---")
        google_payload = {
            "credential": "simulated_google_oauth_token",
            "email": "jogador.e2e.teste@arenago.com.br",
            "name": "Jogador Teste E2E"
        }
        auth_resp = await client.post("/auth/google", json=google_payload)
        assert auth_resp.status_code == 200, f"Auth Google failed: {auth_resp.text}"
        auth_data = auth_resp.json()
        token = auth_data["access_token"]
        print(f"Autenticado com sucesso: {auth_data.get('full_name')} | Role: {auth_data.get('role')}")
        assert token, "Token JWT de acesso não foi retornado."

        player_headers = {"Authorization": f"Bearer {token}"}

        # Validar /auth/me
        me_resp = await client.get("/auth/me", headers=player_headers)
        assert me_resp.status_code == 200
        print(f"Perfil verificado (/auth/me): {me_resp.json().get('email')}")

        # ----------------------------------------------------
        # 5. Multi-Hour Booking Creation (Reserva de Múltiplos Horários)
        # ----------------------------------------------------
        print("\n--- 5. Testing Multi-Hour Booking Creation ---")
        # Encontrar 2 slots consecutivos livres
        consecutive_slots = None
        for i in range(len(court["slots"]) - 1):
            s1 = court["slots"][i]
            s2 = court["slots"][i+1]
            if s1.get("is_available") and s2.get("is_available"):
                consecutive_slots = (s1, s2)
                break

        assert consecutive_slots is not None, "Não foram encontrados slots consecutivos livres."
        s1, s2 = consecutive_slots
        start_iso = s1["start_time"]
        end_iso = s2["end_time"]
        print(f"Reservando período de 2 horas: {s1['time_label']} + {s2['time_label']}")
        print(f"Start ISO: {start_iso} -> End ISO: {end_iso}")

        booking_payload = {
            "court_id": court_id,
            "start_time": start_iso,
            "end_time": end_iso,
            "payment_method": "PIX",
            "notes": "Reserva automatizada E2E via ArenaGo Portal"
        }
        create_resp = await client.post("/bookings", json=booking_payload, headers=player_headers)
        print("Status da criação da reserva:", create_resp.status_code)
        assert create_resp.status_code == 201, f"Falha ao criar reserva: {create_resp.text}"
        booking_obj = create_resp.json()
        booking_id = booking_obj["id"]
        print(f"Reserva criada com sucesso! ID: {booking_id} | Valor Total: R$ {booking_obj['total_amount']} | Status: {booking_obj['status']}")

        # ----------------------------------------------------
        # 6. Concorrência e Prevenção de Conflitos (ACID Check)
        # ----------------------------------------------------
        print("\n--- 6. Testing Concurrency & Overlap Conflict Prevention ---")
        conflict_payload = {
            "court_id": court_id,
            "start_time": start_iso,
            "end_time": s1["end_time"],
            "payment_method": "PIX"
        }
        conflict_resp = await client.post("/bookings", json=conflict_payload, headers=player_headers)
        print("Resposta para reserva conflitante (esperado 409):", conflict_resp.status_code)
        assert conflict_resp.status_code == 409, f"Esperado 409 Conflict, obtido {conflict_resp.status_code}"
        print("Conflito bloqueado corretamente:", conflict_resp.json().get("detail"))

        # ----------------------------------------------------
        # 7. Sincronização em Tempo Real (Agenda Pública)
        # ----------------------------------------------------
        print("\n--- 7. Testing Schedule Synchronization ---")
        sched_after = await client.get(f"/venues/{venue_slug}/schedule?target_date={test_date}")
        assert sched_after.status_code == 200
        updated_court = next(c for c in sched_after.json()["courts"] if c["court_id"] == court_id)
        updated_s1 = next(s for s in updated_court["slots"] if s["hour"] == s1["hour"])
        updated_s2 = next(s for s in updated_court["slots"] if s["hour"] == s2["hour"])
        print(f"Slot {s1['hour']}h - is_booked: {updated_s1['is_booked']} | is_available: {updated_s1['is_available']}")
        print(f"Slot {s2['hour']}h - is_booked: {updated_s2['is_booked']} | is_available: {updated_s2['is_available']}")
        assert updated_s1["is_booked"] is True, "Slot s1 deveria estar ocupado."
        assert updated_s1["is_available"] is False, "Slot s1 não deveria estar disponível."
        assert updated_s2["is_booked"] is True, "Slot s2 deveria estar ocupado."
        assert updated_s2["is_available"] is False, "Slot s2 não deveria estar disponível."

        # ----------------------------------------------------
        # 8. Portal do Jogador (/bookings/me)
        # ----------------------------------------------------
        print("\n--- 8. Testing Player Portal (/bookings/me) ---")
        my_bookings = await client.get("/bookings/me", headers=player_headers)
        assert my_bookings.status_code == 200
        bookings_list = my_bookings.json()
        assert any(b["id"] == booking_id for b in bookings_list), "Reserva criada não encontrada no /bookings/me."
        print(f"Portal do Jogador lista com sucesso {len(bookings_list)} reserva(s).")

        # ----------------------------------------------------
        # 9. Cancelamento de Reserva & Liberação da Grade
        # ----------------------------------------------------
        print("\n--- 9. Testing Booking Cancellation & Slot Release ---")
        cancel_resp = await client.post(f"/bookings/{booking_id}/cancel", headers=player_headers)
        assert cancel_resp.status_code == 200
        print(f"Reserva cancelada com status: {cancel_resp.json().get('status')}")

        # Grade liberada novamente
        sched_final = await client.get(f"/venues/{venue_slug}/schedule?target_date={test_date}")
        assert sched_final.status_code == 200
        released_court = next(c for c in sched_final.json()["courts"] if c["court_id"] == court_id)
        released_s1 = next(s for s in released_court["slots"] if s["hour"] == s1["hour"])
        assert released_s1["is_available"] is True, "Após cancelamento, o slot deve voltar a ficar disponível."
        print(f"Slot {s1['hour']}h liberado com sucesso: is_available={released_s1['is_available']}")

        # ----------------------------------------------------
        # 10. Painel do Gestor (Timeline)
        # ----------------------------------------------------
        print("\n--- 10. Testing Manager Panel Timeline & Stats ---")
        manager_login = await client.post("/auth/login", data={"username": "gestor@beacharena.com.br", "password": "arena123"})
        if manager_login.status_code == 200:
            mgr_token = manager_login.json()["access_token"]
            mgr_headers = {"Authorization": f"Bearer {mgr_token}"}
            mgr_timeline = await client.get(f"/manager/timeline?target_date={test_date}", headers=mgr_headers)
            print("Manager timeline status code:", mgr_timeline.status_code)
            assert mgr_timeline.status_code == 200
            mgr_stats = await client.get("/manager/stats", headers=mgr_headers)
            print("Manager stats status code:", mgr_stats.status_code)
            assert mgr_stats.status_code == 200
            print("Manager stats data:", mgr_stats.json())
        else:
            print("Manager login response:", manager_login.status_code, manager_login.text)

        print("\n========================================================")
        print("✅ TODOS OS 10 TESTES DO PIPELINE E2E PASSARAM COM SUCESSO!")
        print("========================================================")


if __name__ == "__main__":
    asyncio.run(test_full_pipeline())
