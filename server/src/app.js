const Koa = require('koa');
const cors = require('kcors');
const helmet = require('koa-helmet');
const logger = require('koa-logger');
const mongoose = require('mongoose');

const routes = require('./api/routes');

const DB_URI = process.env.NODE_ENV !== 'test' ?
    process.env.DATABASE_URL : process.env.DATABASE_URL_TEST;

const app = new Koa();

/* Logs, Cors, Prevent bruteforce */
app.use(logger());
app.use(cors()); // { origin: 'http://localhost:5000'}
app.use(helmet());

/* Errors */
app.use(async (ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) ctx.throw(404, 'File Not Found');
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = {
            status: 'error',
            message: err.message
        };
    }
});

// Router
app.use(routes.routes());

// Connect to DB
mongoose.connect(DB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

module.exports = app;

