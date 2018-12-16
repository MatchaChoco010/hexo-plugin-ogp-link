const ogs = require('open-graph-scraper')
const util = require('hexo-util')

hexo.extend.filter.register('before_post_render', async data => {
  let content = data.content
  const links = content.match(/\n\[.+\]\(.+\)\n/g)
  if (links === null) return

  const linkTags = await Promise.all(
    links.map(async link => {
      const match = link.match(/\n\[(.+)\]\((.+)\)\n/)
      const title = match[1]
      const url = match[2]

      try {
        const result = await ogs({ url, timeout: 4000 })

        if (!result.success) return `\n<a href="${url}">${title}</a>\n`

        const data = result.data

        return `\n<a href="${data.ogUrl ||
          url}" class="hexo-plugin-ogp-link"><img src=${
          data.ogImage.url
        }><div><h1>${data.ogTitle}</h1><div>{% raw %}${util.truncate(
          data.ogDescription
        )}{% endraw %}</div></div></a>\n`
      } catch (e) {
        return `\n<a href="${url}">${title}</a>\n`
      }
    })
  )

  content = content.replace(/\n\[.+\]\(.+\)\n/g, '\n%link-tag%\n')
  for (let tag of linkTags) {
    content = content.replace(/\n%link-tag%\n/, tag)
  }
  data.content = content
  console.log(data.content)
})
