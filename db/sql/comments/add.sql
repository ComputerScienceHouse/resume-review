insert into comments
values(${resume_id}, ${author}, ${body}, ${date})
returning *