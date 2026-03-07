const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isWatch = process.argv.includes('--watch');

const outdir = path.resolve(__dirname);

async function build() {
  // Build JS bundle (CSS embedded as text via JS injection)
  const jsCtx = await esbuild.context({
    entryPoints: [
      path.resolve(__dirname, 'src/index.js'),
    ],
    bundle: true,
    minify: !isWatch,
    sourcemap: isWatch ? 'inline' : false,
    outfile: path.join(outdir, 'airpilot-widget.js'),
    format: 'iife',
    globalName: 'AirPilotBundle',
    target: ['es2018'],
    define: {
      'process.env.NODE_ENV': isWatch ? '"development"' : '"production"',
    },
    loader: {
      '.css': 'text',
      '.json': 'json',
    },
  });

  // Build standalone CSS bundle (for external loading option)
  const cssEntry = path.join(outdir, 'src/styles/_entry.css');
  fs.writeFileSync(cssEntry, [
    '@import "./base.css";',
    '@import "./dark.css";',
    '@import "./animations.css";',
  ].join('\n'));

  const cssCtx = await esbuild.context({
    entryPoints: [cssEntry],
    bundle: true,
    minify: !isWatch,
    outfile: path.join(outdir, 'airpilot-widget.css'),
    loader: { '.css': 'css' },
  });

  if (isWatch) {
    await Promise.all([jsCtx.watch(), cssCtx.watch()]);
    console.log('[AirPilot] Watching for changes...');
  } else {
    await Promise.all([jsCtx.rebuild(), cssCtx.rebuild()]);
    await Promise.all([jsCtx.dispose(), cssCtx.dispose()]);

    // Clean up temp entry
    fs.unlinkSync(cssEntry);

    // Report sizes
    for (const file of ['airpilot-widget.js', 'airpilot-widget.css']) {
      const p = path.join(outdir, file);
      if (fs.existsSync(p)) {
        const stats = fs.statSync(p);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`[AirPilot] Built ${file} (${sizeKB} KB)`);
      }
    }
    console.log('[AirPilot] Build complete.');
  }
}

build().catch((err) => {
  console.error('[AirPilot] Build failed:', err);
  process.exit(1);
});
