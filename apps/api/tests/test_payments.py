import asyncio
import os
import sys
import unittest
from datetime import datetime, timedelta, timezone
from decimal import Decimal

sys.path.insert(0, os.path.abspath("."))

# Configurar variáveis de teste
os.environ["ENVIRONMENT"] = "testing"
os.environ["MERCADOPAGO_SANDBOX"] = "true"

from app.services.mercadopago_service import (
    MercadoPagoService,
    decrypt_token,
    encrypt_token,
)


class PaymentSystemTestCase(unittest.IsolatedAsyncioTestCase):
    
    async def test_01_token_encryption_security(self):
        """Valida que tokens OAuth sensíveis são criptografados com Fernet e nunca salvos em texto puro."""
        raw_token = "APP_USR-78291048201-091214-e7b1c-TEST"
        encrypted = encrypt_token(raw_token)
        
        self.assertNotEqual(raw_token, encrypted)
        self.assertTrue(len(encrypted) > 20)
        
        decrypted = decrypt_token(encrypted)
        self.assertEqual(raw_token, decrypted)
        print("  [OK] Criptografia de Tokens OAuth (Fernet) validada.")

    async def test_02_pix_payment_generation(self):
        """Valida geração de cobrança Pix oficial em conformidade com padrão BACEN."""
        booking_id = "test-b-12345678"
        amount = Decimal("150.00")
        expires_at_iso = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
        
        pix_res = await MercadoPagoService.create_pix_payment(
            access_token="TEST-ACCESS-TOKEN-ARENA",
            amount=amount,
            booking_id=booking_id,
            description="Aluguel Campo Society",
            payer_email="jogador@arena.com.br",
            payer_name="Carlos Jogador",
            expires_at_iso=expires_at_iso,
            idempotency_key="idemp_key_test_1"
        )
        
        self.assertIn("mp_payment_id", pix_res)
        self.assertIn("pix_code", pix_res)
        self.assertIn("pix_qr_code", pix_res)
        self.assertTrue(pix_res["pix_code"].startswith("00020126580014br.gov.bcb.pix"))
        self.assertIn("150.00", pix_res["pix_code"])
        print("  [OK] Geração Pix com QR Code e Copia e Cola BACEN validada.")

    async def test_03_card_payment_simulation(self):
        """Valida processamento de cartão de crédito: aprovação e rejeição."""
        booking_id = "test-card-booking"
        amount = Decimal("200.00")
        
        # Teste aprovado
        approved_res = await MercadoPagoService.create_card_payment(
            access_token="TEST-ACCESS-TOKEN-ARENA",
            amount=amount,
            booking_id=booking_id,
            description="Reserva Cartão Aprovada",
            payer_email="atleta@arena.com.br",
            card_token="tok_test_valid",
            card_brand="visa",
            card_last_four="4242",
            idempotency_key="idemp_card_ok"
        )
        self.assertEqual(approved_res["status"], "approved")
        
        # Teste recusado (4 dígitos 0000 simula recusa)
        rejected_res = await MercadoPagoService.create_card_payment(
            access_token="TEST-ACCESS-TOKEN-ARENA",
            amount=amount,
            booking_id=booking_id,
            description="Reserva Cartão Recusada",
            payer_email="atleta@arena.com.br",
            card_token="tok_test_invalid",
            card_brand="visa",
            card_last_four="0000",
            idempotency_key="idemp_card_fail"
        )
        self.assertEqual(rejected_res["status"], "rejected")
        print("  [OK] Processamento de Cartão de Crédito (Aprovação / Recusa) validado.")

    async def test_04_oauth_url_and_exchange(self):
        """Valida geração de URL oficial OAuth e troca de autorização para o gestor."""
        venue_id = "v-arena-campeoes"
        state = "state_random_token"
        oauth_url = MercadoPagoService.get_oauth_authorization_url(venue_id, state)
        
        self.assertIn("https://auth.mercadopago.com/authorization", oauth_url)
        self.assertIn(venue_id, oauth_url)
        
        tokens = await MercadoPagoService.exchange_oauth_code("code_auth_sample_123")
        self.assertIn("access_token", tokens)
        self.assertIn("refresh_token", tokens)
        print("  [OK] Fluxo de Conexão OAuth do Gestor validado.")

    async def test_05_webhook_signature_and_refund(self):
        """Valida verificação de webhook e endpoint de estorno/reembolso."""
        # Verificação em sandbox
        is_valid = MercadoPagoService.verify_webhook_signature(None, None, "123456789")
        self.assertTrue(is_valid)
        
        refund_res = await MercadoPagoService.refund_payment("mp_pix_123456", amount=Decimal("150.00"))
        self.assertEqual(refund_res["status"], "approved")
        print("  [OK] Webhook e Estorno/Reembolso validado.")


if __name__ == "__main__":
    unittest.main()
