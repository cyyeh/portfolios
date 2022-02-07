/*
  This program would scan all the yaml files inside the `portfolios` directory,
  and each yaml file represents one project. After scanning each yaml file, the program
  would use puppeteer to generate the screenshot of the project inside the yaml file.
  Besides that, it'll gather all other contents and generate html content.
  Finally the website is inside the `dist/index.html`, and it coulde be deployed to
  the GitHub Pages using `gh-pages`.
*/
import fs from 'fs'
import { readdir } from 'fs/promises'

import yaml from 'js-yaml'
import puppeteer from 'puppeteer'

const portfolios = []

const generateScreenshot = async (url, savedImage, dir = `dist/images/`) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.screenshot({ path: `${dir}${savedImage}` })

  await browser.close()
}

const generateHtmlContent = (portfolios) => {
  let bodyContent = `<div class="row">`

  portfolios.forEach(({ title, description, demo_url, repo_url, screenshot }) => {
    bodyContent += `
      <div class="col s12 m3 l4">
        <div class="card large">
          <div class="card-image">
            <img src=${screenshot}>
          </div>
          <div class="card-content">
            <span class="card-title">${title}</span>
            <p>${description}</p>
          </div>
          <div class="card-action">
            <a href=${demo_url} target="_blank">Demo</a>
            <a href=${repo_url} target="_blank">Code</a>
          </div>
        </div>
      </div>
    `
  })
  bodyContent += `</div>`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='utf-8'>
      <title>Portfolios</title>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        .nav-wrapper {
          margin-left: 20px;
        }
        .row {
          margin: 50px 30px 50px 30px;
        }
        @media screen and (max-width: 800px) {
          .nav-wrapper {
            margin-left: auto;
          }
          .row {
            margin: 10px 5px 10px 5px;
          }
        }
      </style>
    </head>
    <body>
      <nav>
        <div class="nav-wrapper">
          <a href="/portfolios" class="brand-logo"><i class="material-icons">computer</i>Portfolios</a>
          <ul id="nav-mobile" class="right">
            <li>
              <a href="https://github.com/cyyeh/portfolios" target="_blank">
                <i class="fab fa-github fa-lg"></i>
              </a>
            </li>
          </ul>
        </div>
      </nav>
      ${bodyContent}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/js/all.min.js" integrity="sha512-Tn2m0TIpgVyTzzvmxLNuqbSJH3JP8jm+Cy3hvHrW7ndTDcJ1w5mBiksqDBb8GpE2ksktFvDB/ykZ0mDpsZj20w==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
    </body>
    </html>
  `.trim().replace(/\>\s+\</g,'><')
}

const saveHtmlFile = (htmlContent) => {
  const stream = fs.createWriteStream(`dist/index.html`)
  stream.once('open', () => {
    stream.end(htmlContent)
  })
}


// Step 1: scan each yaml files inside the `portfolios` directory
try {
  const yamlFilesFolder = `./portfolios`
  const files = await readdir(yamlFilesFolder)
  files.forEach(file => {
    yaml.loadAll(
      fs.readFileSync(`${yamlFilesFolder}/${file}`, 'utf8'),
      async (content) => {
        if (content) {
          // Step 2: use puppeteer to generate the screenshot of the project inside the yaml file
          const savedImage = `${file.split('.')[0]}.jpg`
          await generateScreenshot(content.demo_url, savedImage)
          // add screenshot image link to the content object
          content['screenshot'] = `images/${savedImage}`

          portfolios.push(content)

          // Step 3: gather all other contents and generate html content
          // check if portfolios are gathered completely
          if (portfolios.length === files.length) {
            const htmlContent = generateHtmlContent(portfolios)
            // Step 4: put the final web site inside the `dist/index.html`
            saveHtmlFile(htmlContent)
          }
        }
      }
    )
  })
} catch (e) {
  console.error(e)
}
