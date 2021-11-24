<template>
  <div class="back">
    <div id="loginFormBox">
      <!--标题-->
      <div id="header_title">
        <h2>系统登录</h2>
      </div>
      <!--表单本体-->
      <div id="Form">
        <el-form ref="loginFormRef" :model="user" :rules="rules">
          <el-form-item class="formItem" prop="username">
            <el-input placeholder="" v-model="user.username">
              <i slot="prefix" class="el-icon-user"></i>
            </el-input>
          </el-form-item>
          <el-form-item class="formItem" prop="password">
            <el-input placeholder="" v-model="user.password" show-password>
              <i slot="prefix" class="el-icon-lock"></i>
            </el-input>
          </el-form-item>
          <el-form-item class="formBtns">
            <el-button class="btn_el_form" :type="postBtnType" :disabled="postBtnStatus" @click="login()" v-loading.fullscreen.lock="fullscreenLoading">
              登录
            </el-button>
            <el-button class="btn_el_form" type="info" @click="resetForm()">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      /**创建user对象*/
      user: {
        //账号
        username: '',
        //密码
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入登录名', trigger: 'blur' },
        ],
        password : [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ]
      },
      callBackData_User : {},
      fullscreenLoading : false,
    };
  },
  computed : {
    postBtnType(){
      if(this.user.username == '' || this.user.password == ''){
        return 'danger'
      }else{
        return 'success'
      }
    },
    postBtnStatus(){
      if(this.user.username == '' || this.user.password == ''){
        return true;
      }else{
        return false;
      }
    }
  },
  methods: {
    resetForm(){
      this.$refs.loginFormRef.resetFields();
    },
    login(){
      this.fullscreenLoading = true;
      let url = '/api/user/login';
      const username = this.user.username;
      const password = this.user.password;
      url += '/' + username;
      url += '/' + password;
      axios.get(url).then(response => {
        const data = response.data;
        const resultCode = data.code;
        if(resultCode == 0){
          this.$message.success(data.message);
          this.callBackData_User = data.data;
          window.sessionStorage.setItem('user',JSON.stringify(this.callBackData_User),30);
          this.$router.push({
            name : 'home'
          });
          this.fullscreenLoading = false;
        }else{
          this.$message.error(data.message);
          this.fullscreenLoading = false;
          return;
        }
      }).catch(error => {
        this.$message.error("发生未知错误,请联系系统管理员！");
        this.fullscreenLoading = false;
      })
    }
  },
}
</script>
<style scoped>
.back {
  height: 100%;
  background-color: rgb(71, 71, 71);
}
#header_title {
  height: 60px;
}
#loginFormBox {
  width: 500px;
  height: 300px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.formItem {
  height: 60px;
  bottom: 0;
  width: 100%;
  padding: 0px 20px;
  box-sizing: border-box;
}
.formBtns {
  height: 70px;
  position: absolute;
  top: 90%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.formBtns .btn_el_form {
  width: 80px;
  height: 45px;
}
.formBtns .btn_el_form i {
  width: 100%;
}
</style>
