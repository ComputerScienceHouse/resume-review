select resumes.filename, resumes.date, resumes.author, comment_count, resume_count
    from resumes
    inner join 
    (select resumes.author, count(comments.*) as comment_count
        from resumes
        inner join
        comments
            on resumes.id = comments.parent_id
        group by resumes.author
    ) commentct
        on commentct.author = resumes.author
    inner join
    ( select r.author, count(*) as resume_count
        from resumes as r group by r.author
    ) resumect
        on resumect.author = resumes.author
    where resumes.date in (select max(date) from resumes group by author)
group by commentct.author, resumes.id, comment_count, resumect.author, resumect.resume_count
order by resumes.date desc