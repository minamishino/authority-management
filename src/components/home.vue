<template>
  <div class="page">
    <el-container class="page">
      <el-header class="header">
        <div id="home_header">
          <myHeader></myHeader>
        </div>
        <div id="user_info">
          <logout></logout>
        </div>
      </el-header>
      <el-container>
        <el-aside :width="width" class="aside">
          <div class="toggle-button" @click="closeNavMenu"><i :class="icon"></i>
          </div>
          <div align="left">
            <myNav></myNav>
          </div>
        </el-aside>
        <el-main class="main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import logout from './login-moudel/logout.vue'
import myHeader from './header-moudel/header.vue'
import myNav from './nav-moudel/nav.vue'
import PubSub from 'pubsub-js'

export default {
  data() {
    return {
      state : true,
      width:'15%',
    };
  },
  computed : {
    icon(){
      if(this.state){
        return "el-icon-s-fold"
      }else{
        return "el-icon-s-unfold"
      }
    }
  },
  components : {
    logout,
    myHeader,
    myNav
  },
  methods: {
    closeNavMenu(){
      const PubSub = require('pubsub-js');
      PubSub.publish('closeMenu')
      this.width = this.width == '15%' ? '64px' : '15%';
      this.state = !(this.state);
    }
  },
}
</script>
<style scoped>
.page{
  height: 100%;
  background-color: #fff;
}
.header{
  background-color: #2b2f3a;
}
.aside{
  background-color: #2e3b4d;
}
#user_info{
  height: 100%;
  box-sizing: border-box;
  float: right;
  padding: 9px;
}
.toggle-button{
  background-color:rgb(236, 236, 236);
  height: 30px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  width: 100%;
  position: relative;
  z-index: 999999;
}
.main{
  background-color: #f0f2f5;
}
.el-icon-s-fold{
  font-size: 30px;
  border: 0;
}
.el-icon-s-unfold{
  font-size: 30px;
  border: 0;
}
#home_header{
  float: left;
}
</style>
