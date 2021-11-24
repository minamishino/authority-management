<template>
  <div>
    <el-dropdown trigger="click" @command="openDialog()">
      <span class="el-dropdown-link">
        <el-avatar class="el-avatar-box">{{user.username}}</el-avatar>
      </span>
      <el-dropdown-menu slot="dropdown" >
        <el-dropdown-item command="exit">退出</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      user: {},
    };
  },
  created() {
    this.user = window.sessionStorage.getItem('user');
    this.user = JSON.parse(this.user);
    console.log(this.user);
  },
  methods: {
    openDialog(val) {
      this.$confirm('此操作将退出'+this.user.username+'的登录', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.get('/api/user/logout').then(res => {
          console.log(res.data);
          const data = res.data;
          this.$message.success(data.message);
        });
        window.sessionStorage.clear();
        this.$router.push('/login');
      }).catch(error => {

      })
    }
  },
}
</script>
<style>
.el-dropdown-link{
  color: #fff;
  font-size: 16px;
  text-align: center;
}
</style>
