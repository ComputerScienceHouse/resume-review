--Fetches users that posted a resume in the past 24 hours
SELECT t.author
FROM resumes t
INNER JOIN (
	SELECT author, max(date) as MaxDate
	FROM resumes
	WHERE date > now() - interval '24 hours'
	GROUP BY author
) rm ON t.author = t.author AND t.date = rm.MaxDate
