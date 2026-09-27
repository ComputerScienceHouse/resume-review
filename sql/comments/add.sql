insert into comments
values(${parent_id}, ${id}, ${author}, ${body}, ${date})
returning *