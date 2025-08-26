from celery import Celery
import os


def create_celery_app() -> Celery:
    broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
    backend_url = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/1")
    app = Celery(
        "edu_rag",
        broker=broker_url,
        backend=backend_url,
        include=["apps.workers.tasks"],
    )
    app.conf.update(task_track_started=True, task_time_limit=900)
    return app


celery_app = create_celery_app()


