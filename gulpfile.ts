import { paths, dist } from './config/config';

const gulp = require('gulp');
const server = require('browser-sync').create();
const Mem = require('gulp-mem');
const prefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const filter = require('gulp-filter');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const nunjucks = require('gulp-nunjucks');
const data = require('gulp-data');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const cleanCSS = require('gulp-clean-css');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');
const empty = require('gulp-empty');
const webpack = require('webpack');
const ws = require('webpack-stream');
const named = require('vinyl-named');
const del = require('del');

const mem = new Mem();
mem.serveBasePath = dist;

let isProd = false;

function reload(done) {
    server.reload();
    done();
}

function serve(done) {
    server.init({
        server: dist,
        host: '0.0.0.0',
        port: 5555,
        cors: true,
        middleware: mem.middleware,
    });
    done();
}

gulp.task('vendors:js', () => {
    let wsc = require('./config/webpack.config.js');
    wsc.mode = isProd ? 'production': 'development';
    // let mode = isProd ? 'production': 'development';
    const task = gulp.src(paths.src.common.js)
        .pipe(named())
        .pipe(ws(wsc, webpack));

    if (!isProd) return task.pipe(mem.dest(paths.output.js));

    return task.pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(paths.output.js))
        .pipe(rev.manifest('vendors-js-manifest.json'))
        .pipe(gulp.dest(paths.output.rev))
});

gulp.task('vendors:css', () => {
    const task = gulp.src(paths.src.common.css)
        .pipe(sass().on('error', sass.logError))
        .pipe(prefixer({
            browsers: ['> 5%', 'ie >= 9', 'ff >= 28', 'Chrome >= 21'],
            cascade: false
        }));
    
    if (!isProd) return task.pipe(cleanCSS({ format: 'beautify', rebaseTo: paths.rebaseTo }))
            .pipe(mem.dest(paths.output.css));
    
    return task.pipe(cleanCSS({ level: { 1: { specialComments: false }}, rebaseTo: paths.rebaseTo }))
        .pipe(rev())
        .pipe(gulp.dest(paths.output.css))
        .pipe(rev.manifest('vendors-css-manifest.json'))
        .pipe(gulp.dest(paths.output.rev));
});

gulp.task('js', () => {
    const task =  gulp.src(paths.src.js)
        .pipe(named())
        .pipe(ws(require('./config/webpack.config.js'), webpack));
    
    if (!isProd) return task.pipe(mem.dest(paths.output.js));

    return task.pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(paths.output.js))
        .pipe(rev.manifest('js-manifest.json'))
        .pipe(gulp.dest(paths.output.rev));
});

gulp.task('scss', () => {
    const task = gulp.src(paths.src.scss)
        .pipe(sass().on('error', sass.logError))
        .pipe(prefixer({
            browsers: ['> 5%', 'ie >= 9', 'ff >= 28', 'Chrome >= 21'],
            cascade: false
        }));

    if (!isProd) return task.pipe(cleanCSS({ format: 'beautify', rebaseTo: paths.rebaseTo }))
            .pipe(mem.dest(paths.output.css));

    return task.pipe(cleanCSS({ level: { 1: { specialComments: false }}, rebaseTo: paths.rebaseTo }))
        .pipe(rev())
        .pipe(gulp.dest(paths.output.css))
        .pipe(rev.manifest('css-manifest.json'))
        .pipe(gulp.dest(paths.output.rev));
});

gulp.task('template', () => {
    const task = gulp.src(paths.src.template)
        .pipe(nunjucks.compile());

    if (!isProd) return task.pipe(mem.dest(paths.output.root));

    return task.pipe(gulp.dest(paths.output.root));
});

gulp.task('sprites', () => {
    const spriteData = gulp.src(paths.src.sprites).pipe(spritesmith({
        imgName: 'icons.png',
        cssName: '_icons.scss',
        imgPath: '../../assets/images/icons.png',
        padding: 10,
        imgOpts: { quality: 100 },
        algorithm : 'top-down',
        algorithmOpts: { sort: true },
    }));

    const imgStream = spriteData.img
        .pipe(gulp.dest(paths.output.sprites.images));

    const cssStream = spriteData.css
        .pipe(gulp.dest(paths.output.sprites.scss));

    return merge(imgStream, cssStream);
});

gulp.task('assets', () => {
    const task = gulp.src(paths.src.assets);

    if (!isProd) return task.pipe(mem.dest(paths.output.assets));
    
    return task.pipe(rev())
        .pipe(gulp.dest(paths.output.assets))
        .pipe(rev.manifest('assets-manifest.json'))
        .pipe(gulp.dest(paths.output.rev));
});

gulp.task('process', () => {
    const task = gulp.src(paths.process)
        .pipe(revCollector());

    if (!isProd) return task.pipe(mem.dest(dist));

    return task.pipe(gulp.dest(dist));
});

gulp.task('watch:assets',
    () => gulp.watch(paths.watch.assets, gulp.series('assets', reload)));

gulp.task('watch:sprites',
    () => gulp.watch(paths.watch.sprites, gulp.series('sprites', gulp.parallel('assets', 'vendors:css'), reload)));

gulp.task('watch:vendors:js',
    () => gulp.watch(paths.watch.common.js, gulp.series('vendors:js', reload)));

gulp.task('watch:vendors:css',
    () => gulp.watch(paths.watch.common.css, gulp.series('vendors:css', reload)));
    
gulp.task('watch:vendors:_',
    () => gulp.watch(paths.watch.common._, gulp.series(gulp.parallel('vendors:css', 'scss'), reload)));

gulp.task('watch:js',
    () => gulp.watch(paths.watch.js, gulp.series('js', reload)));

gulp.task('watch:scss',
    () => gulp.watch(paths.watch.scss, gulp.series('scss', reload)));

gulp.task('watch:template',
    () => gulp.watch(paths.watch.template, gulp.series('template', reload)));

gulp.task('watch', gulp.parallel([
    'watch:assets',
    'watch:sprites',
    'watch:vendors:js',
    'watch:vendors:css',
    'watch:vendors:_',
    'watch:template',
    'watch:js',
    'watch:scss'
]));

gulp.task('webserver',gulp.series(serve));

gulp.task('prodMode', () => {
    process.env.NODE_ENV = "production";
    del.sync(dist);
    isProd = true;
    return gulp.src('src');
});

gulp.task('devMode', () => {
    process.env.NODE_ENV = 'development';
    isProd = false;
    return gulp.src('src');
});

gulp.task('dev', 
    gulp.series(
        'devMode',
        'sprites',
        gulp.parallel([
            'assets',
            'vendors:js',
            'vendors:css',
            'js',
            'scss',
            'template',
        ]),
        gulp.parallel([
            'watch',
            'webserver'
        ])
    ));

gulp.task('prod',
    gulp.series([
        'prodMode',
        'sprites',
        gulp.parallel([
            'assets',
            'vendors:js',
            'vendors:css',
            'js',
            'scss',
            'template',
        ]),
        'process'
    ]));

gulp.task('default', gulp.parallel('dev'));