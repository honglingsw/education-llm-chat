// src/data/interviews.js
export default [
    {
      id: 1,
      title: "教师资格面试",
      description:
        "聚焦教育教学场景！专业反馈答题逻辑，帮你夯实教师职业素养。",
      type: "structured",
      code: "TEACHER_QUALIFICATION_EXAM",
      image: require("@/assets/avatar/TEACHER_QUALIFICATION_EXAM.png"),
      icon: "el-icon-user-solid",
      isForWaiting: false
    },
    {
      id: 2,
      title: "教师招聘面试",
      description:
        "精准匹配教师岗位！分场景实战模拟，提升班级管理与综合素养应答能力。",
      type: "structured",
      code: "TEACHER_RECRUITMENT_EXAM",
      image: require("@/assets/avatar/TEACHER_RECRUITMENT_EXAM.png"),
      icon: "el-icon-user-solid",
      isForWaiting: false
    },
    {
      id: 3,
      title: "公务员面试",
      description:
        "培养政务思维！实时评估回答的拆解深度与对策可行性，练出“公务员式”精准应答！",
      type: "structured",
      code: "GOV_EXAM",
      image: require("@/assets/avatar/GOV_EXAM.png"),
      icon: "el-icon-user",
      isForWaiting: false
    },
    {
      id: 5,
      title: "事业编面试",
      description: "强化岗位认知！帮你告别“外行思维”，用“岗位专家”视角征服考官！",
      type: "structured",
      code: "GOV_INTERVIEW",
      image: require("@/assets/avatar/GOV_INTERVIEW.png"),
      icon: "el-icon-user-solid",
      isForWaiting: true
    },
    {
      id: 6,
      title: "AI产品经理",
      description:
        "题库由BAT等大厂以及顶尖AI创业公司的产品负责人参与编审，深度还原头部企业考核标准，覆盖产品设计、技术边界评估、商业化闭环等核心能力模型。",
      type: "internet",
      code: "AI_PRODUCT_MANAGER",
      image: require("@/assets/avatar/AI_PRODUCT_MANAGER.png"),
      icon: "el-icon-user-solid",
      isForWaiting: true
    },
    {
      id: 7,
      title: "产品运营",
      description:
        "整合字节跳动、美团等增长团队实战题库，涵盖用户生命周期管理、GMV拆解、AB实验等硬核指标考核体系。",
      type: "internet",
      code: "PRODUCT_OPERATION",
      icon: "el-icon-user-solid",
      image: require("@/assets/avatar/PRODUCT_OPERATION.png"),
      isForWaiting: true
    },
    {
      id: 8,
      title: "前端开发",
      description:
        "对标头部大厂中高级面试标准，精选框架原理、浏览器渲染机制等高频考点，覆盖30+大厂终面真题原型。",
      type: "internet",
      code: "FRONTEND_DEVELOPMENT",
      image: require("@/assets/avatar/FRONTEND_DEVELOPMENT.png"),
      icon: "el-icon-user-solid",
      isForWaiting: true
    },
    {
      id: 9,
      title: "后端开发",
      description:
        "聚焦于数据库管理、服务器架构、API设计等领域，同时包括云计算、微服务等新兴领域的内容，汇集了一系列考察候选人技术深度和广度的问题。",
      type: "internet",
      code: "BACKEND_DEVELOPMENT",
      image: require("@/assets/avatar/BACKEND_DEVELOPMENT.png"),
      icon: "el-icon-user-solid",
      isForWaiting: true
    },
    {
      id: 10,
      title: "数据科学",
      description:
        "聚焦数据驱动决策全链路能力培养，题库覆盖数据清洗、特征工程、统计建模等核心技能。",
      type: "structured",
      code: "DATA_SCIENCE",
      image: require("@/assets/avatar/DATA_SCIENCE.png"),
      icon: "el-icon-user-solid",
      isForWaiting: true
    }
  ];
  