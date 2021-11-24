<template>
  <div>
    <el-menu class="el-menu-vertical-demo" background-color="#2e3b4d" text-color="#fff" active-text-color="#409EFF" router unique-opened :collapse="isCollapse" v-loading="loading" :collapse-transition="false" :default-active="default_active">

      <el-submenu v-for="(item,index ) in data" :key="index" :index="item.id + ''" class="item_title">
        <template slot="title">
          <i :class="item.icon"></i>
          <span>{{item.name}}</span>
        </template>
        <el-menu-item v-for="(child,index) in item.children" :key="index" :index="'/home/'+child.path+'/'+child.id" @click="changeActive('/home/'+child.path+'/'+child.id)">
          <template slot="title">
            <i :class="child.icon"></i>
            <span>{{child.name}}</span>
          </template>
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import Pubsub from 'pubsub-js'
const PubSub = require('pubsub-js');
import axios from 'axios';
export default {
  data() {
    return {
      data: {},
      loading: true,
      isCollapse: false,
      default_active: ''
    };
  },
  methods: {
    initData() {
      const user = window.sessionStorage.getItem('user');
      if (!user) {
        this.$message.error("您未登录,或登录信息已过期！");
        this.$router.push('/login');
      } else {
        const url = '/api/menuitem/select'
        axios.get(url).then(res => {
          this.data = res.data.data;
          this.loading = false;
        }).catch(err => {
          this.$message.error("发生未知错误,请联系系统管理员！");
          this.loading = true;
        })
      }

    },
    changeActive(val) {
      this.default_active = val;
    },
    closeThisMenu() {
      PubSub.subscribe('closeMenu', (msg) => {
        this.isCollapse = !(this.isCollapse);
      })
    }
  },
  mounted() {
    this.initData();
    this.closeThisMenu();
  },
}
</script>
<style>
.item_title {
  margin: 0;
}
.el-menu-vertical-demo {
  border: none;
}
</style>
