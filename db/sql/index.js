const QueryFile = require('pg-promise').QueryFile;
const path = require('path');

function sql(file) {
    const fullPath = path.join(__dirname, file);
    const options = {
        minify: true,
    };
    const qf = new QueryFile(fullPath, options);
    if (qf.error) console.log(qf.error);
    return qf;
}

module.exports = {
    resumes: {
        create: sql('resumes/create.sql'),
        empty: sql('resumes/empty.sql'),
        drop: sql('resumes/drop.sql'),
        add: sql('resumes/add.sql'),
        find: sql('resumes/find.sql'),
        findByAuthor: sql('resumes/findByAuthor.sql'),
        delete: sql('resumes/delete.sql'),
    },
    comments: {
        create: sql('comments/create.sql'),
        empty: sql('comments/empty.sql'),
        drop: sql('comments/drop.sql'),
        add: sql('comments/add.sql'),
        find: sql('comments/find.sql'),
        findByParent: sql('comments/findByParent.sql'),
        delete: sql('comments/delete.sql'),
    }
};