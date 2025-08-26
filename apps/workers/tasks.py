from .celery_app import celery_app


@celery_app.task(name="videos.index")
def index_video(video_id: str) -> str:
    return f"indexed {video_id}"


@celery_app.task(name="grading.run")
def run_grading(submission_id: str) -> str:
    return f"graded {submission_id}"


