# Phase 3: 环境搭建

> 2026-05-12

## 已完成

- [x] 项目目录结构
- [x] 后端：Python + FastAPI + treys
- [x] 前端：React + Vite
- [x] Docker Compose（前后端一键启动）
- [x] .gitignore
- [x] Git 初始化（已 commit）

## 启动方式

```bash
# 方式一：Docker 启动（推荐）
cd projects/poker-coach
docker-compose up --build

# 访问：
# 前端: http://localhost:3000
# 后端: http://localhost:8000

# 方式二：本地开发
# 终端1 - 后端
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 终端2 - 前端
cd frontend
npm run dev
```

## 项目结构

```
poker-coach/
├── Phase0-product/    # 产品定义
├── Phase1-interaction/ # 交互设计 + SVG线框图
├── Phase2-ui/          # UI设计 + 高保真原型
├── backend/            # Python FastAPI
│   ├── app/
│   │   ├── api/        # API 路由
│   │   ├── engine/     # 模拟引擎（待开发）
│   │   ├── models/     # 数据模型
│   │   └── main.py     # 入口
│   ├── tests/
│   └── Dockerfile
├── frontend/           # React + Vite
│   ├── src/
│   │   ├── pages/      # 页面
│   │   ├── components/ # 组件
│   │   └── api/        # API 封装
│   └── Dockerfile
└── docker-compose.yml
```
