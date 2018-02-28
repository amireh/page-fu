module.exports = [
  {
    match: { by: 'url', on: '*' },
    regions: [
      {
        name: 'Core::Content',
        options: { framed: true },
        outlets: [
          {
            name: 'Markdown::Document',
            using: 'articles',
            match: {
              by: 'namespace',
              on: 'articles'
            }
          },
          {
            name: 'JS::Module',
            match: {
              by: 'namespace',
              on: 'js'
            }
          },
        ]
      },

      {
        name: 'Core::Sidebar',
        outlets: [
          {
            name: 'Markdown::Browser',
            using: 'articles'
          },
          {
            name: 'Core::SidebarHeader',
            options: {
              text: 'API'
            }
          },
          {
            name: 'JS::Browser',
            using: 'js',
          },

          {
            name: 'Core::SidebarSearch',
            options: {
              text: 'Search'
            }
          },
        ]
      },
    ]
  }
];