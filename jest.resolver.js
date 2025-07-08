const fs = require('fs');
const path = require('path');

module.exports = (request, options) => {
  // Handle relative imports ending with .js
  if ((request.startsWith('./') || request.startsWith('../')) && request.endsWith('.js')) {
    const tsRequest = request.replace(/\.js$/, '.ts');
    const tsPath = path.resolve(options.basedir, tsRequest);

    // Check if the .ts file exists
    if (fs.existsSync(tsPath)) {
      return tsPath;
    }
  }

  // Use the default resolver for everything else
  return require.resolve(request, {
    paths: [options.basedir],
  });
};
