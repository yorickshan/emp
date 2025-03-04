// 参考 https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpack.config.js
//
const {setPaths, getPaths, cachePaths} = require('../helpers/paths')
const {getProjectConfig} = require('../helpers/project')
const webpack = require('webpack')
const {buildServeConfig} = require('../helpers/build')
const chalk = require('chalk')
const {logger} = require('../helpers/logger.js')
// const ora = require('ora')
// const spinner = ora('=== EMP Build Start ===\n').start()
module.exports = async args => {
  const {src, dist, public} = args
  await setPaths({src, dist, public})
  const paths = getPaths()
  const {webpackConfig: config, empConfig} = await getProjectConfig('production', args, paths)
  // before build hook
  if (typeof empConfig.beforeBuild === 'function') {
    await empConfig.beforeBuild(config)
  }
  //
  webpack(config, (err, stats) => {
    if (err) {
      console.error(err.stack || err)
      if (err.details) {
        console.error(err.details)
        // spinner.fail(`=== EMP Build Fail! ===\n`)
      }
      return
    }
    // spinner.succeed('=== EMP Build Completed! ===\n')
    if (stats.hasWarnings()) {
      logger.info(chalk.yellow.bold('\n=== EMP Compiled with warnings.===\n'))
      logger.warn(
        stats.toString({
          all: false,
          colors: true,
          warnings: true,
        }),
      )
    }
    //
    if (stats.hasErrors()) {
      // const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true'
      logger.error(
        stats.toString({
          all: false,
          colors: true,
          errors: true,
        }),
      )
      logger.info(chalk.red.bold('\n=== EMP Failed to compile.===\n'))
      process.exit(1)
    }
    logger.info(chalk.green.bold('\n=== EMP Compiled successfully.===\n'))
    logger.info(
      `\n` +
        stats.toString({
          // chunks: false,
          colors: true,
          all: false,
          assets: true,
          // warnings: false,
          // error: false,
        }),
    )
    // 复制其他文件到dist
    // copyPublicFolder(paths)
    // 生成 serve 模式下需要文件
    buildServeConfig(cachePaths.buildConfig, {devServer: config.devServer})
  })
}
