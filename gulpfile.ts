const gulp = require('gulp');
const ts = require('gulp-typescript');
const gulpif = require('gulp-if');
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
const server = require('gulp-server-livereload');
// const cssAdjustUrlPath = require('gulp-css-adjust-url-path');
const cleanCSS = require('gulp-clean-css');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');
const empty = require("gulp-empty");
const tsCompiler = ts.createProject('./tsconfig.json');

const del = require('del');

del.sync('./dist');

let isProd = false;

const urlPattern = /(url\(['"]?)[/]?()/g;
const exts = '{jpg,jpeg,png,svg,ttf,eot,woff,woff2}';

const paths = {
    src: {
        js: ['src/js/**/*.ts'],
        css: ['src/css/**/*.css'],
        scss: ['src/scss/**/*.scss'],
        assets: [`src/assets/**/*.${exts}`],
        sprites: [`src/sprites/icons/**/*.png`],
        template: ['src/templates/**/*.html'],
    },
    common: {
        js: [
            'src/js/common/third-party/high-priority/**/*.js',
            'src/js/common/**/*.js',
        ],
        css: [
            'src/css/common/high-priority/**/*.css',
            'src/scss/common/high-priority/**/*.scss',
            'src/css/common/**/*.css',
            'src/scss/common/*.scss'
        ],
    },
    filter: {
        js: ['**', '!src/js/common/**/*.js'],
        css: ['**', '!src/css/common/**/*.css'],
        scss: ['**', '!src/scss/common/**/*.scss'],
        template: ['**', '!src/templates/common/**/*.html'],
    },
    output: {
        root: 'dist',
        rev: 'dist/rev',
        js: 'dist/js',
        css: 'dist/css',
        scss: 'src/scss/common',
        sprites: 'src/scss/common/_',
        assets: 'dist/assets',
        images: 'src/assets/images'
    },
    process: ['dist/rev/**/*.json', 'dist/**/*.css', 'dist/**/*.html'],
    rebaseTo: 'src/dist/'
};

gulp.task('vendors:js:compile',
    () => gulp.src(paths.common.js)
        .pipe(concat('vendors.js'))
        .pipe(isProd ? uglify() : empty())
        .pipe(isProd ? rev() : empty())
        .pipe(gulp.dest(paths.output.js))
        .pipe(isProd ? rev.manifest('vendors-js-manifest.json') : empty())
        .pipe(isProd ? gulp.dest(paths.output.rev) : empty()));

gulp.task('vendors:css:compile',
    () => gulp.src(paths.common.css)
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('vendors.css'))
        .pipe(prefixer({
            browsers: ['> 5%', 'ie >= 9', 'ff >= 28', 'Chrome >= 21'],
            cascade: false
        }))
        .pipe(
            isProd
            ? cleanCSS({ level: { 1: { specialComments: false }}, rebaseTo: paths.rebaseTo })
            : cleanCSS({ format: 'beautify', rebaseTo: paths.rebaseTo })
        )
        .pipe(isProd ? rev() : empty())
        // .pipe(cssAdjustUrlPath(urlPattern))
        .pipe(gulp.dest(paths.output.css))
        .pipe(isProd ? rev.manifest('vendors-css-manifest.json') : empty())
        .pipe(isProd ? gulp.dest(paths.output.rev) : empty()));

gulp.task('js:compile', () => {
    const f = filter(paths.filter.js);
    return gulp.src(paths.src.js)
        .pipe(f)
        // .pipe(cssAdjustUrlPath(urlPattern))
        .pipe(tsCompiler())
        .pipe(isProd ? uglify() : empty())
        .pipe(isProd ? rev() : empty())
        .pipe(gulp.dest(paths.output.js))
        .pipe(isProd ? rev.manifest('js-manifest.json') : empty())
        .pipe(isProd ? gulp.dest(paths.output.rev) : empty());
});

gulp.task('sass:compile', () => {
    const f = filter(paths.filter.scss);
    return gulp.src(paths.src.scss)
        .pipe(f)
        .pipe(sass().on('error', sass.logError))
        .pipe(prefixer({
            browsers: ['> 5%', 'ie >= 9', 'ff >= 28', 'Chrome >= 21'],
            cascade: false
        }))
        .pipe(
            isProd
                ? cleanCSS({ level: { 1: { specialComments: false }}, rebaseTo: paths.rebaseTo })
                : cleanCSS({ format: 'beautify', rebaseTo: paths.rebaseTo })
        )
        .pipe(isProd ? rev() : empty())
        // .pipe(cssAdjustUrlPath(urlPattern))
        .pipe(gulp.dest(paths.output.css))
        .pipe(isProd ? rev.manifest('css-manifest.json') : empty())
        .pipe(isProd ? gulp.dest(paths.output.rev) : empty());
});

gulp.task('template:compile', () => {
    const f = filter(paths.filter.template);
    return gulp.src(paths.src.template)
        .pipe(f)
        .pipe(nunjucks.compile())
        .pipe(gulp.dest(paths.output.root));
});

gulp.task('sprites', () => {
    const spriteData = gulp.src(paths.src.sprites).pipe(spritesmith({
        imgName: 'icons.png',
        cssName: '_icons.scss',
        imgPath: '../../../assets/images/icons.png',
        padding: 10,
        imgOpts: { quality: 100 },
        algorithm : 'top-down',
        algorithmOpts: { sort: true },
    }));

    const imgStream = spriteData.img
        .pipe(gulp.dest(paths.output.images));

    const cssStream = spriteData.css
        .pipe(gulp.dest(paths.output.sprites));

    return merge(imgStream, cssStream);
});

gulp.task('assets',
    () => gulp.src(paths.src.assets)
        .pipe(isProd ? rev() : empty())
        .pipe(gulp.dest(paths.output.assets))
        .pipe(isProd ? rev.manifest('assets-manifest.json') : empty())
        .pipe(isProd ? gulp.dest(paths.output.rev) : empty()));

gulp.task('watch:assets',
    () => gulp.watch(paths.src.assets, gulp.parallel('assets')));

gulp.task('watch:sprites',
    () => gulp.watch(paths.src.sprites, gulp.series('sprites', gulp.parallel('assets', 'vendors:css:compile'))));

gulp.task('watch:vendors:js',
    () => gulp.watch(paths.common.js, gulp.parallel('vendors:js:compile')));

gulp.task('watch:vendors:css',
    () => gulp.watch(paths.common.css, gulp.parallel('vendors:css:compile')));

gulp.task('watch:js',
    () => gulp.watch(paths.src.js, gulp.parallel('js:compile')));

gulp.task('watch:scss',
    () => gulp.watch(paths.src.scss, gulp.parallel('sass:compile')));

gulp.task('watch:template',
    () => gulp.watch(paths.src.template, gulp.series('template:compile')));

gulp.task('process',
    () => gulp.src(paths.process)
            .pipe(revCollector())
            .pipe(gulp.dest('dist')));

gulp.task('watch', gulp.parallel([
    'watch:assets',
    'watch:sprites',
    'watch:vendors:js',
    'watch:vendors:css',
    'watch:template',
    'watch:js',
    'watch:scss'
]));

gulp.task('webserver',
    () => gulp.src('dist')
        .pipe(server({
            defaultFile: 'index.html',
            host: 'localhost',
            port: '5555',
            livereload: {
                enable: true,
                filter: function (filePath, cb) {
                    cb(!/\.s(a|c)ss$|node_modules/.test(filePath));
                }
            },
            open: true,
        })));

gulp.task('prodMode', () => {
    isProd = true;
    return gulp.src('src');
});

gulp.task('devMode', () => {
    isProd = false;
    return gulp.src('src');
});

gulp.task('dev', 
    gulp.series(
        'devMode',
        'sprites',
        gulp.parallel([
            'assets',
            'vendors:js:compile',
            'vendors:css:compile',
            'js:compile',
            'sass:compile',
            'template:compile',
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
            'vendors:js:compile',
            'vendors:css:compile',
            'js:compile',
            'sass:compile',
            'template:compile',
        ]),
        'process'
    ]));

gulp.task('default', gulp.parallel('dev'));