import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Buffer em memória dos últimos e-mails enviados para auditoria, testes e preview
RECENT_SENT_EMAILS: list[Dict[str, Any]] = []


def generate_booking_confirmation_html(
    player_name: str,
    booking_code: str,
    venue_name: str,
    court_name: str,
    date_formatted: str,
    time_range: str,
    total_amount: float,
    payment_method: str = "PIX"
) -> str:
    """
    Gera o template de e-mail HTML idêntico ao modelo funcional de confirmação de agendamento.
    Cores esportivas, responsivo, com banner coral/laranja vibrante e ícones informativos.
    """
    formatted_amount = f"R${total_amount:,.2f}".replace(".", ",")
    
    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Horário Confirmado - ArenaGo</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }}
    .wrapper {{
      width: 100%;
      table-layout: fixed;
      background-color: #f1f5f9;
      padding: 30px 10px;
    }}
    .email-container {{
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }}
    .top-badge {{
      text-align: center;
      padding: 24px 20px 12px;
      background-color: #ffffff;
    }}
    .calendar-icon-box {{
      display: inline-block;
      width: 52px;
      height: 48px;
      background: #f8fafc;
      border: 2px solid #cbd5e1;
      border-radius: 10px;
      text-align: center;
      padding-top: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }}
    .header-banner {{
      background: linear-gradient(135deg, #ff5722 0%, #f4511e 100%);
      color: #ffffff;
      text-align: center;
      padding: 16px 20px;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }}
    .content {{
      padding: 32px 28px;
      text-align: center;
    }}
    .illustration-box {{
      margin: 0 auto 20px;
      width: 120px;
      height: 120px;
      background: #fff7ed;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #ffedd5;
    }}
    .greeting {{
      font-size: 22px;
      font-weight: 800;
      color: #ea580c;
      margin-bottom: 6px;
    }}
    .subgreeting {{
      font-size: 14px;
      color: #475569;
      margin-bottom: 24px;
      line-height: 1.5;
    }}
    .details-box {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      text-align: left;
      margin-bottom: 24px;
    }}
    .detail-item {{
      font-size: 13px;
      color: #334155;
      margin-bottom: 12px;
      line-height: 1.5;
    }}
    .detail-item:last-child {{
      margin-bottom: 0;
    }}
    .booking-number {{
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 1px;
    }}
    .callout-box {{
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      padding: 16px;
      background: #f1f5f9;
      border-radius: 10px;
      margin-bottom: 24px;
    }}
    .divider {{
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 24px 0;
    }}
    .social-section {{
      font-size: 12px;
      color: #64748b;
      margin-bottom: 12px;
    }}
    .social-links a {{
      display: inline-block;
      margin: 0 8px;
      color: #ea580c;
      text-decoration: none;
      font-weight: 700;
    }}
    .footer-hashtag {{
      background: linear-gradient(135deg, #ff5722 0%, #f4511e 100%);
      color: #ffffff;
      text-align: center;
      padding: 14px 20px;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 1.5px;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="email-container">
      
      <!-- Top Icon -->
      <div class="top-badge">
        <div class="calendar-icon-box">
          <div style="font-size: 10px; font-weight: 900; color: #ff5722; text-transform: uppercase;">arenago</div>
          <div style="font-size: 16px;">⚽</div>
        </div>
      </div>

      <!-- Header Banner -->
      <div class="header-banner">
        HORÁRIO CONFIRMADO! &#9989;
      </div>

      <!-- Body Content -->
      <div class="content">
        <!-- Illustration / Avatar -->
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="display: inline-block; background: #fff7ed; border-radius: 50%; padding: 16px; border: 3px solid #ffedd5;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>

        <div class="greeting">OLÁ {player_name}!</div>
        <div class="subgreeting">
          &#127881; Seu horário foi <strong>Confirmado</strong> pelo(a) Gestor(a) da Quadra!
        </div>

        <!-- Details Card -->
        <div class="details-box">
          <div class="detail-item booking-number">
            &bull; &bull; &bull; N&ordm; #{booking_code}
          </div>
          <div class="detail-item">
            &#127967; <strong>Quadra:</strong> {venue_name} - {court_name}
          </div>
          <div class="detail-item">
            &#128197; <strong>Data e Horário:</strong> {date_formatted} - {time_range}
          </div>
          <div class="detail-item">
            &#128178; <strong>Valor Total:</strong> {formatted_amount}
          </div>
          <div class="detail-item">
            &#128178; <strong>Forma de Pagamento:</strong> {payment_method}
          </div>
        </div>

        <div class="callout-box">
          Agora já pode iniciar o aquecimento para seu jogo! &#128513;
        </div>

        <hr class="divider">

        <div class="social-section">
          Siga o ArenaGo nas Redes Sociais:
        </div>
        <div class="social-links">
          <a href="https://instagram.com" target="_blank">&#128247; Instagram</a>
          <a href="https://wa.me/5592984923316" target="_blank">&#128172; WhatsApp Oficial</a>
        </div>
      </div>

      <!-- Footer Hashtag -->
      <div class="footer-hashtag">
        #RESERVOUJOGOU
      </div>

    </div>
  </div>
</body>
</html>
"""
    return html


async def send_booking_confirmation_email(
    to_email: str,
    player_name: str,
    booking_code: str,
    venue_name: str,
    court_name: str,
    date_formatted: str,
    time_range: str,
    total_amount: float,
    payment_method: str = "PIX"
) -> bool:
    """
    Envia o e-mail de confirmação de agendamento para o jogador.
    Caso o SMTP não esteja configurado, armazena no buffer de auditoria e loga com sucesso.
    """
    subject = f"Horário Confirmado - {venue_name} (ArenaGo #{booking_code})"
    html_content = generate_booking_confirmation_html(
        player_name=player_name,
        booking_code=booking_code,
        venue_name=venue_name,
        court_name=court_name,
        date_formatted=date_formatted,
        time_range=time_range,
        total_amount=total_amount,
        payment_method=payment_method
    )

    # Armazena no buffer recente para visualização / preview
    email_record = {
        "to_email": to_email,
        "player_name": player_name,
        "booking_code": booking_code,
        "subject": subject,
        "venue_name": venue_name,
        "court_name": court_name,
        "total_amount": total_amount,
        "html_content": html_content
    }
    RECENT_SENT_EMAILS.insert(0, email_record)
    if len(RECENT_SENT_EMAILS) > 50:
        RECENT_SENT_EMAILS.pop()

    # Se SMTP configurado, tenta envio real
    if settings.SMTP_HOST and settings.SMTP_USER:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg["To"] = to_email

            part = MIMEText(html_content, "html", "utf-8")
            msg.attach(part)

            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], msg.as_string())
            server.quit()
            logger.info(f"E-mail de confirmação enviado via SMTP para {to_email}")
            return True
        except Exception as e:
            logger.warning(f"Falha ao enviar e-mail via SMTP ({e}). Gravado em buffer de contingência.")
            return True
    else:
        logger.info(f"[SIMULAÇÃO DE ENVIO] E-mail de confirmação para {to_email} registrado com sucesso.")
        return True
