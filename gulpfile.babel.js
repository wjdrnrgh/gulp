import gulp from "gulp";
import gpug from "gulp-pug";
import gimg from "gulp-image";
import gwebserver from "gulp-webserver";
import ghpage from "gulp-gh-pages";
import gautoprefixer from "gulp-autoprefixer";
import gbro from "gulp-bro";
import gminiCSS from "gulp-csso";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import babelify from "babelify";
import del from "del";

const sass = gulpSass(dartSass);

const routes = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
};

//--prepare--//
const clean = async () => {
  await del(["build"]);
};

//--assets--//
const img = () => {
  return gulp.src(routes.img.src).pipe(gimg()).pipe(gulp.dest(routes.img.dest));
};

const pug = () => {
  return gulp.src(routes.pug.src).pipe(gpug()).pipe(gulp.dest(routes.pug.dest));
};

const styles = () => {
  return gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(
      gautoprefixer({
        browsers: ["last 2 versions"], //브라우저 최신 버전의 전 전 버전까지 호환 가능하도록 설정
      })
    )
    .pipe(gminiCSS())
    .pipe(gulp.dest(routes.scss.dest));
};

const js = async () => {
  await gulp
    .src(routes.js.src)
    .pipe(
      gbro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));
};

//--liveServer--//
const devserver = () => {
  gulp.src("build").pipe(
    gwebserver({
      livereload: true,
    })
  );
};
const watch = () => {
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
};

//--deploy--//
const deployment = async () => {
  await gulp.src("build/**/*").pipe(ghpage());
};

const prepare = gulp.series([clean]);
const assets = gulp.series([img, pug, styles, js]);
const liveServer = gulp.parallel([devserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, liveServer]);
export const deploy = gulp.series([build, deployment]);
