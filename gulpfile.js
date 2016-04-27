//引入插件
var gulp = require('gulp');
var webserver = require('gulp-webserver');
var clean = require('gulp-clean');
var less = require('gulp-less');//处理less
var minifyCss = require('gulp-minify-css');//压缩css
var uglify = require('gulp-uglify');//压缩，混淆js
var autoprefixer = require('gulp-autoprefixer');//自动补全浏览器兼容css
var gulpif = require('gulp-if');
var path = require('path');

//运行Gulp时，默认的Task
gulp.task('default', ['build','webserver']);

gulp.task('build', ['clean','css','js','copy']);

gulp.task('webserver', function() {
  gulp.src('./src')
    .pipe(webserver({
    	host:'localhost',
    	path:'/',
      livereload: true,
      directoryListing: true,
      open: true,
       fallback: 'index.html'
    }));
});

gulp.task('clean', function() {
  return gulp.src('build', { read:false })
        .pipe(clean());
});
var hasExtname = function(extname) {
  if(extname[0] !== '.'){
    extname = '.' + extname;
  }
  return function(file) {
    return path.extname(file.path) === extname;
  }
}
gulp.task('css', ['clean'],function() {
  return gulp.src(['src/**/*.css', 'src/**/*.less'])
    .pipe(minifyCss())
    .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true 
        }))

    .pipe(gulpif(hasExtname('less'), less()))
    .pipe(gulp.dest('build'));
});

gulp.task('js',['clean'], function() {
  return gulp.src('src/**/*.js') // 匹配 'client/js/somedir/somefile.js' 并且将 `base` 解析为 `client/js/`
  .pipe(uglify())
  .pipe(gulp.dest('build'))
  .pipe(gulp.dest('dist')); 
});

gulp.task("copy", ['clean'],function() {
  return gulp.src(["src/**/*.png", "src/**/*.jpg", "src/**/*.jpeg", "src/**/*.gif", "src/**/*.json",
      "src/**/*.html", "src/**/*.htm","src/**/*.woff", "src/**/*.ttf", "src/**/*.eot", "src/**/*.svg"
    ])
    .pipe(gulp.dest("build"));
});

// //创建watch任务去检测html文件,其定义了当html改动之后，去调用一个Gulp的Task
// gulp.task('watch', function () {
//   gulp.watch(['./src/**/*.html','./src/**/*.js','./src/**/*.css'], ['reload']);
// });

// //使用connect启动一个Web服务器
// gulp.task('connect', function () {
//   connect.server({
//     root: 'src',
//     livereload: true
//   });
// });

// gulp.task('reload', function () {
//   gulp.src(['./src/**/*.html','./src/**/*.js','./src/**/*.css'])
//     .pipe(connect.reload());
// });
