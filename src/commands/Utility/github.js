const snekfetch = require('snekfetch')

const MY_GIT = 'BobbyWibowo/Lightbringer'

exports.run = async (bot, msg, args) => {
  if (msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  if (!args.length) {
    throw new Error('You must specify something to search!')
  }

  const prev = msg.content

  if (args[0].indexOf('/') !== -1) {
    const repo = safeRepo(args[0])
    await msg.edit(`${PROGRESS}Loading info for \`${repo}\`\u2026`)
    try {
      const res = await snekfetch.get(`https://api.github.com/repos/${repo}`)
      if (!res || !res.body) {
        throw new Error('An unexpected error occurred!')
      }
      return msg.edit(prev, { embed: buildEmbedFromJson(res.body) })
    } catch (err) {
      if (new RegExp('404 Not Found', 'i').test(err.toString())) {
        throw new Error('That repository could not be found!')
      } else {
        throw err
      }
    }
  } else {
    const query = args.join(' ')
    await msg.edit(`${PROGRESS}Searching for \`${query}\`\u2026`)
    const res = await snekfetch.get(`https://api.github.com/search/repositories?q=${args.join('+')}`)
    if (res.body.items.length < 1) {
      return msg.error(`${FAIL}No results found for '${args.join(' ')}'`)
    }
    const count = res.body.items.length = Math.min(3, res.body.items.length)
    await msg.edit(`${SUCCESS}Top ${count} result${count !== 1 ? 's' : ''} for \`${query}\`:`)
    const send = async i => {
      if (!res.body.items[i]) {
        return
      }
      await msg.channel.send({ embed: buildEmbedFromJson(res.body.items[i]) })
      await send(i + 1)
    }
    return send(0)
  }
}

const safeRepo = input => {
  if (input.indexOf('/') === -1) {
    return
  }

  const user = input.substr(0, input.indexOf('/'))
  input = input.substr(input.indexOf('/') + 1)
  const repo = input.indexOf('/') === -1 ? input : input.substr(0, input.indexOf('/'))
  return `${user}/${repo}`
}

const buildEmbedFromJson = json => {
  // NOTE: Special treatment
  const isMyGit = json.full_name === MY_GIT

  return bot.utils.formatEmbed('', json.description || 'No description provided.',
    [
      {
        title: 'Information',
        fields: [
          {
            name: 'Owner',
            value: `[${json.owner.login}](${json.owner.html_url})`
          },
          {
            name: 'Primary language',
            value: json.language || 'N/A'
          }
        ]
      },
      {
        title: 'Links',
        fields: [
          {
            name: '',
            value: `[Home page](${json.html_url})`
          },
          {
            name: '',
            value: `[Downloads](${json.html_url}/releases)`
          },
          {
            name: '',
            value: `[Issues](${json.html_url}/issues)`
          }
        ],
        inline: true
      },
      {
        title: 'Statistics',
        fields: [
          {
            name: 'Open issues',
            value: json.open_issues_count
          },
          {
            name: 'Stars',
            value: json.stargazers_count
          },
          {
            name: 'Watchers',
            value: json.subscribers_count || json.watchers_count
          }
        ],
        inline: true
      },
      {
        title: 'Clone',
        fields: [
          {
            value: bot.utils.formatCode(`git clone ${json.clone_url}`)
          }
        ]
      }
    ],
    {
      author: {
        name: json.full_name,
        icon: 'https://a.safe.moe/cxwFp.png',
        url: json.html_url
      },
      color: isMyGit ? '#ff0000' : '#4078c0',
      thumbnail: isMyGit ? 'https://a.safe.moe/pM9Ov.png' : ''
    }
  )
}

exports.info = {
  name: 'github',
  usage: 'github <user/repo>',
  description: 'Links to a GitHub repository',
  aliases: ['git']
}
