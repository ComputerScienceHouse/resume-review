create table comments
(
    resume_id references resumes(id),
    author text,
    filename text,
    date timestamp without time zone
)