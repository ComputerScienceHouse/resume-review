import pgPromise from 'pg-promise';
import path from 'path';
import { fileURLToPath } from 'url';

// https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
// __dirname isn't defined in ES Modules and this code was initially written before ES Modules were a thing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QueryFile = pgPromise.QueryFile;

function sql(file) {
    const fullPath = path.join(__dirname, file);
    const options = {
        minify: true,
    };
    const qf = new QueryFile(fullPath, options);
    if (qf.error) console.log(qf.error);
    return qf;
}

export default {
    resumes: {
        create: sql('resumes/create.sql'),
        empty: sql('resumes/empty.sql'),
        drop: sql('resumes/drop.sql'),
        add: sql('resumes/add.sql'),
        find: sql('resumes/find.sql'),
        findByAuthor: sql('resumes/findByAuthor.sql'),
        delete: sql('resumes/delete.sql'),
        newestByAuthor: sql('resumes/newestByAuthor.sql'),
        dailyDigest: sql('resumes/dailyDigest.sql')
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
