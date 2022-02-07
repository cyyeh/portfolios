import { micromark } from 'micromark'
import { gfm, gfmHtml } from 'micromark-extension-gfm'

const micromarkExtensionObj = {
  extensions: [gfm()],
  htmlExtensions: [gfmHtml()],
}

const value = '* [x] contact@example.com ~~strikethrough~~'
const result = micromark(value, micromarkExtensionObj)

console.log(result)
