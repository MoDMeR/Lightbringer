const ENCODE = /^e(nc(ode)?)?$/i
const DECODE = /^d(ec(ode)?)?$/i

exports.methods = {
  encode: input => {
    return input.toString().split('').map(c => c.charCodeAt(0).toString(2))
  },
  decode: input => {
    const _input = typeof input === 'string' ? input.split(' ') : input
    return _input.map(c => parseInt(c, 2)).map(c => String.fromCharCode(c)).join('')
  }
}

exports.run = async (bot, msg, args) => {
  if (args.length < 2) {
    throw new Error(`Do \`${config.prefix}help binary\` to see how to use this.`)
  }

  const input = args.slice(1).join(' ')
  if (ENCODE.test(args[0])) {
    return msg.edit(this.methods.encode(input).join(' '))
  } else if (DECODE.test(args[0])) {
    return msg.edit(this.methods.decode(input))
  } else {
    throw new Error(`Unknown sub command: \`${args[0]}\``)
  }
}

exports.info = {
  name: 'binary',
  usage: 'binary <encode|decode> <input>',
  description: 'Encodes/decodes your input to/from binary'
}
