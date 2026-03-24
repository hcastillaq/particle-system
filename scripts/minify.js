import gulp from "gulp";
import terser from "gulp-terser";

function build() {
	return gulp
		.src(["package/**/*.js", "!package/**/*.min.js"])
		.pipe(terser({ module: true }))
		.pipe(gulp.dest("package"));
}

build();
