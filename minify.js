import gulp from "gulp";
import minify from "gulp-minify";

gulp
	.src(["package/*/**.js", "!*.min.js"])
	.pipe(
		minify({
			ext: {
				min: ".js",
			},
			noSource: true,
		}),
	)
	.pipe(gulp.dest("package", {}));
