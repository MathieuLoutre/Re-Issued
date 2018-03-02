const browserSync = require('browser-sync').create()
const gulp = require('gulp')
const plumber = require('gulp-plumber')
const stylus = require('gulp-stylus')
const cleanCSS = require('gulp-clean-css')
const htmlmin = require('gulp-htmlmin')
const prefix = require('autoprefixer-stylus')
const bro = require('gulp-bro')
const babelify = require('babelify')
const del = require('del')

gulp.task('clean', function () {
    return del(['./dist/**/*'])
})

gulp.task('css', function () {
    return gulp.src(['./src/assets/styles/app.styl'])
        .pipe(plumber())
        .pipe(stylus({
            use: prefix(),
            include: ['node_modules']
        }))
        .pipe(gulp.dest('./dist/assets'))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('css-prod', function () {
    return gulp.src(['./src/assets/styles/app.styl'])
        .pipe(plumber())
        .pipe(stylus({
            use: prefix(),
            include: ['node_modules']
        }))
        .pipe(cleanCSS({ compatibility: '*' }))
        .pipe(gulp.dest('./dist/assets'))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('copy-html', function () {
    return gulp.src(['./src/*.html'])
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('copy-html-prod', function () {
    return gulp.src(['./src/*.html'])
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('copy-images', function () {
    return gulp.src('./src/assets/images/**/*')
        .pipe(gulp.dest('./dist/assets/images'))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('copy-fonts', function () {
    return gulp.src('./src/assets/fonts/**/*')
        .pipe(gulp.dest('./dist/assets/fonts'))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('js', function () {
    return gulp.src(['./src/assets/js/app.js'])
        .pipe(bro({
            transform: [
                babelify.configure({ presets: ['env'] })
            ]
        }))
        .pipe(gulp.dest('./dist/assets'))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('js-prod', function () {
    return gulp.src(['./src/assets/js/app.js'])
        .pipe(bro({
            transform: [
                babelify.configure({ presets: ['env'] }),
                ['uglifyify', { global: true }]
            ]
        }))
        .pipe(gulp.dest('./dist/assets'))
        .pipe(browserSync.reload({ stream: true }))
})

gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: './dist/'
        },
        host: 'localhost',
        open: false,
        notify: false
    })

    gulp.watch('./src/assets/styles/*.styl', ['css'])
    gulp.watch('./src/*.html', ['copy-html'])
    gulp.watch('./src/assets/images/**/*', ['copy-images'])
    gulp.watch('./src/assets/js/*', ['js'])
    gulp.watch('./src/assets/fonts/**/*', ['copy-fonts'])
})

gulp.task('build', ['clean'], function () {
    gulp.start(['copy-images', 'copy-fonts', 'copy-html-prod', 'css-prod', 'js-prod'])
})

gulp.task('default', ['build', 'serve'])
