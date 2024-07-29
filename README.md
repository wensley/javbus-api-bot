# javbus-api-bot
[NSFW]一个查番号的电报机器人

### 部署与使用指南：javbus-api-bot


#### 前置条件

在开始之前，请确保你已经安装了以下工具：

1. **1panel/aaPanel**：推荐使用面板的“运行环境”部署。
2. 建议使用海外主机，境内主机自行解决代理问题。
3. **电报Token**：自行申请。
4. **javbus-api**：部署参考https://github.com/ovnrain/javbus-api
   

#### 步骤1：克隆仓库

首先，克隆 GitHub 仓库到你的本地机器：

```sh
git clone https://github.com/wensley/javbus-api-bot.git
cd javbus-api-bot
```

#### 步骤2：配置环境变量

需要修改配置一些环境变量。参见`telegramBot.js` 第4、6行注释说明；

#### 步骤3：1panel项目配置参考
![javbusapibot](https://github.com/user-attachments/assets/b5b60974-9af1-4070-ad41-94afb6e8a871)


配置好点确认启动即可

#### Bot命令使用指南

```
/search - [关键字] 搜索影片关键字
/id - [番号] 获取影片详细信息
/star - [番号] 获取指定女优的作品
/starsearch - [关键字]  关键字搜索女优
/starpage - [番号] [页码]获取指定番号更多作品
/latest - 最新AV作品
```
### 效果预览
![javbusapibot1](https://github.com/user-attachments/assets/3a8955c6-c19a-46fe-91d2-4ef962bc2a8f)


#### 文件概述

- **index.js**：项目的入口文件。
- **telegramBot.js**：Telegram 机器人的主要逻辑文件。
- **package.json**：项目依赖和脚本配置文件。

#### 其他注意事项

1. **环境变量**：参见`telegramBot.js` 第4、6行注释说明。
2. **依赖版本**：项目可能依赖于特定版本的库，建议不要随意升级依赖，以避免兼容性问题。

### 已知问题

经测试会存在一些番号搜不到，无解。

### 说明

项目代码由Claude生成，说明文件由ChatGPT生成。
