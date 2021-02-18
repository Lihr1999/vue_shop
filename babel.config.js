// 这是项目发布阶段需要用到的 babel 插件
const prodPlugins = []
// 可以通过process.env.NODE_ENV判断配置项
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布产品时候的插件数组 需要扩展运算符展开数组
    ...prodPlugins,
    // 路由懒加载的插件
    '@babel/plugin-syntax-dynamic-import'
  ]
}
