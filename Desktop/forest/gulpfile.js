const gulp = require('gulp');
const pug = require('gulp-pug');

const sass = require('gulp-sass');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const globImporter = require("sass-glob-importer");

const del = require('del');

const browserSync = require('browser-sync').create();

const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require("cheerio");
const replace = require("gulp-replace");

//svg config
const config = {
    mode: {
        symbol: {
            sprite: "../sprite.svg",
            example: {
                dest: '../'
            }
        }
    }
};

gulp.task('sprite', function() {
    return gulp
        .src("src/images/icons/*.*")
        .pipe(svgmin({ js2svg: { pretty: true } }))
        .pipe(cheerio({
            run: function() {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
                $('[fill]').removeAttr('fill');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(replace("&gt;", ">"))
        .pipe(svgSprite(config))
        .pipe(gulp.dest("build/assets/images/"));
});

const paths = {
    root: './build',
    templates: {
        pages: 'src/templates/pages/*.pug',
        src: 'src/templates/**/*.pug'
    },
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'build/assets/styles/'
    },
    images: {
        src: 'src/images/**/*.*',
        dest: 'build/assets/images/'
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'build/assets/scripts/bundle.js'
    },
    fonts: {
        src: 'src/fonts/*.*',
        dest: 'build/assets/fonts/'
    }
}

// pug
function templates() {
    return gulp.src(paths.templates.pages)
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(paths.root));
}

// scss
function styles() {
    return gulp.src('./src/styles/app.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(sourcemaps.write())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.styles.dest))
}

//fonts
function fonts() {
    return gulp.src('./src/fonts/*.*')
        .pipe(gulp.dest(paths.fonts.dest));

}

// очистка
function clean() {
    return del(paths.root);
}

// webpack
function scripts() {
    return gulp.src('src/scripts/app.js')
        .pipe(gulpWebpack(webpackConfig, webpack))
        .pipe(gulp.dest(paths.scripts.dest));
}

// галповский вотчер
function watch() {
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.templates.src, templates);
    gulp.watch(paths.images.src, images);
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.fonts.src, fonts);
}

// локальный сервер + livereload (встроенный)
function server() {
    browserSync.init({
        server: paths.root
    });
    browserSync.watch(paths.root + '/**/*.*', browserSync.reload);
}

// просто переносим картинки
function images() {
    return gulp.src(paths.images.src)
        .pipe(gulp.dest(paths.images.dest));
}

gulp.task('default', gulp.series(
    clean,
    gulp.parallel(styles, templates, images, scripts),
    gulp.parallel(watch, server)
));

//sass-glob-importer
gulp.task('style', function() {
    return gulp.src('.src/styles/app.scss')
        .pipe(sass({ importer: gloImporter() }))
        .pipe(gulp.dest('./build/assetes/styles/'))
})

// JS Plumber
gulp.task('uglify', function() {
    gulp.src('src/scripts/**/*.js')
        .pipe(plumber()) // plumber
        .pipe(uglify())
        .pipe(gulp.dest('build/assets/scripts/bundle.js'))
});

// CSS Plumber
gulp.task('concat', function() {
    gulp.src('src/styles/*.*')
        .pipe(plumber())
        .pipe(concatCSS('concatenate.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('build/assets/styles/*.*'))
});

exports.templates = templates;
exports.styles = styles;
exports.clean = clean;
exports.images = images;
exports.fonts = fonts;