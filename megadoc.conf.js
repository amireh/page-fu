const path = require('path');

module.exports = {
  outputDir: path.resolve(__dirname, 'doc/compiled'),
  assetRoot: path.resolve(__dirname),
  strict: false,
  serializer: [ 'megadoc-html-serializer', {
    theme: [ 'megadoc-theme-minimalist', {} ],
    title: 'page-fu',
    resizableSidebar: false,
    favicon: null,
    metaDescription: 'page.js routing sugars',
    footer: 'Crafted with &#9829; using <a href="https://github.com/megadoc">megadoc</a>.',
    tooltipPreviews: false,
    rewrite: {
      'articles': '/',
      '/readme.html': '/index.html',
    },
    runtimeOutputPath: 'megadoc-assets',
    layoutOptions: {
      banner: false,
      customLayouts: require('./doc/layout'),
    },
    notFoundComponent: path.resolve(__dirname, 'doc/pages/404.js'),
  }],

  sources: [
    {
      id: 'js',
      include: [ 'src/*.js' ],
      processor: [ 'megadoc-plugin-js', {
        id: 'js',
        showSourcePaths: false,
        strict: false,
        linkToNamespacesInBrowser: false,
        parserOptions: {
          presets: [['es2015', { modules: false }]],
          babelrc: false,
        },
        builtInTypes: [
          {
            name: 'page.Context',
            href: 'https://visionmedia.github.io/page.js/#context'
          }
        ]
      }]
    },
    {
      id: 'articles',
      include: [
        'README.md',
        'doc/examples.md',
        'doc/testing.md',
        'CHANGELOG.md',
      ],
      processor: [ 'megadoc-plugin-markdown', {
        id: 'articles',
        baseURL: '/articles',
        strict: false,
        fullFolderTitles: false,
        discardIdPrefix: 'doc-',
      }]
    }
  ]
}