const ogs = require('open-graph-scraper')

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
        const result = ogs({ url, timeout: 4000 })

        if (!result.success) return `<a href="${url}">${title}</a>`

        return `<a href="${result.ogUrl}" class="ogp-link"><h1>${
          result.ogTitle
        }</h1><img src=${result.ogImage.url}><div>${
          result.ogDescription
        }</div></a>`
      } catch (e) {
        return `<a href="${url}">${title}</a>`
      }
    })
  )

  for (let tag of linkTags) {
    content = content.replace(/\n\[.+\]\(.+\)\n/, tag)
  }
  data.content = content
  console.log(data.content)
})
