import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from celery import Celery
from core.config import settings

celery_app = Celery(
    "tasks",
    broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
    backend=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"
)

@celery_app.task
def send_verification_email(email: str, code: str):
    msg = MIMEMultipart()
    msg["From"] = settings.MAIL_FROM
    msg["To"] = email
    msg["Subject"] = "Email Verification Code"
    body = f"""
    Your verification code is: {code}
    This code expires in 5 minutes.
    """
    msg.attach(MIMEText(body, "plain"))
    with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
        server.starttls()
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.sendmail(settings.MAIL_FROM, email, msg.as_string())