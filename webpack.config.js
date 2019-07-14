const path = require('path');
const exec = require('child_process').exec;

const HtmlWebpackPlugin = require('html-webpack-plugin');

function execute(commands) {
  exec(commands.join(';'), (err, stdout, stderr) => {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  });
}
function log(msg) {
  exec(`echo "${msg}"`, (err, stdout, stderr) => {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  });
}

module.exports = env => {
  return {
    entry: './src/index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, './dist')
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader'
            }
          ]
        },
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        REPOSITORY_URL: JSON.stringify(require("./package.json").repository.url),
      }),
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        inject: 'body',
        filename: 'index.html'
      }),
      {
        apply: compiler => {
          compiler.hooks.afterEmit.tap('AfterEmitPlugin', compilation => {
            if (!env) {
              log('Environment was not specified. Add --env.commit to commit');
              return;
            }
            if (env.commit) {
              execute([`bash ./build.sh "${REPOSITORY_URL}" "${new Date().toString()}"`]);
            }
          });
        }
      }
    ]
  };
};