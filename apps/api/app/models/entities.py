from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, JSON, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship


def utc_now() -> datetime:
    """Return current UTC time - industry standard for database timestamps."""
    return datetime.now(timezone.utc)


Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False, default="student")  # admin | tutor | student
    created_at = Column(DateTime, default=utc_now, nullable=False)


class Form(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, nullable=True)
    course_id = Column(Integer, nullable=True)
    settings_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(32), nullable=False)  # mcq | short | open | numeric
    prompt = Column(Text, nullable=False)
    rubric_id = Column(Integer, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    form = relationship("Form", back_populates="questions")


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, nullable=True)
    storage_key = Column(String(512), nullable=False)
    duration = Column(Integer, nullable=True)
    lang = Column(String(8), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# --- Classrooms ---

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    enrollments = relationship("ClassroomEnrollment", back_populates="classroom", cascade="all, delete-orphan")
    assignments = relationship("ClassroomAssignment", back_populates="classroom", cascade="all, delete-orphan")


class ClassroomEnrollment(Base):
    __tablename__ = "classroom_enrollments"
    __table_args__ = (UniqueConstraint("classroom_id", "user_id", name="uq_classroom_user"),)

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(32), nullable=False, default="student")  # student only for now
    created_at = Column(DateTime, default=utc_now, nullable=False)

    classroom = relationship("Classroom", back_populates="enrollments")


class ClassroomAssignment(Base):
    __tablename__ = "classroom_assignments"
    __table_args__ = (UniqueConstraint("classroom_id", "form_id", name="uq_classroom_form"),)

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False, index=True)
    form_id = Column(Integer, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    classroom = relationship("Classroom", back_populates="assignments")


# --- Submissions ---

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    submitted_at = Column(DateTime, nullable=True)

    answers = relationship("Answer", back_populates="submission", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    submission = relationship("Submission", back_populates="answers")
