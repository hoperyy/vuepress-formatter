const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

const srcFolder = path.join(__dirname, 'dist');
const targetFolder = path.join(__dirname, '../../build');

const CDNURL = '//xxx';

const generatePages = () => {
    const targetPageFolder = path.join(targetFolder, 'pages');

    // 遍历 dist 目录
    fs.readdirSync(srcFolder).forEach(filename => {
        const currentFilePath = path.join(srcFolder, filename);

        let srcHtmlPath;
        let targetHtmlPath;

        if (fs.statSync(currentFilePath).isDirectory()) {
            srcHtmlPath = path.join(currentFilePath, 'index.html');

            if (!fs.existsSync(srcHtmlPath)) {
                return;
            }

            targetHtmlPath = path.join(targetPageFolder, `${filename}.html`);
        } else if (fs.statSync(currentFilePath).isFile()) {
            if (!/\.html/.test(filename)) {
                return;
            }

            const pageName = path.basename(filename, '.html');
            srcHtmlPath = currentFilePath;
            targetHtmlPath = path.join(targetPageFolder, `${pageName}.html`);
        }

        let content = fs.readFileSync(srcHtmlPath, 'utf-8');

        const lastScriptStartTagIndex = content.lastIndexOf('<script');
        const lastScriptEndTagIndex = content.lastIndexOf('</script>');

        content = `${content.substring(0, lastScriptStartTagIndex)}${content.substring(lastScriptEndTagIndex + 9)}`

        // content = content.replace('target="_blank" rel="noopener noreferrer" class="nav-link external"', 'target="_self" rel="noopener noreferrer" class="nav-link"');

        fse.ensureFileSync(targetHtmlPath);
        fs.writeFileSync(targetHtmlPath, content);
    });
};

const generateStatic = () => {
    const targetStaticFolder = path.join(targetFolder, 'static/assets');
    const srcStaticFolder = path.join(srcFolder, 'assets');
    fse.ensureDirSync(targetStaticFolder);
    fse.copySync(srcStaticFolder, targetStaticFolder);
};

module.exports = {
    title: 'Test',
    description: 'Just Do It',
    themeConfig: {
        nav: [
            { text: 'nav1', link: 'javascript:;' }
        ]
    },
    configureWebpack: (config, isServer) => {
        // 修改客户端的 webpack 配置
        if (config.mode === 'production' && !isServer) {
            const path = require('path');
            const OnBuildWebpack = require('on-build-webpack');
            config.output.publicPath = `${CDNURL}/`;

            config.plugins.push(new OnBuildWebpack(() => {
                const timer = setTimeout(() => {
                    generatePages();
                    generateStatic();
                    clearTimeout(timer);
                }, 5000);
            }));
        }
    }
}