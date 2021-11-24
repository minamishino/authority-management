<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input placeholder="请输入内容" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2" v-for="(btn,index) in btns" :key="index">
          <el-button @click="toDo(btn.name)">{{btn.name}}</el-button>
        </el-col>
        <el-col :span="2">
          <el-button @click="Deselect" :disabled="disable">取消选择</el-button>
        </el-col>
      </el-row>
      <el-table ref="singleTable" :data="data" highlight-current-row @current-change="handleCurrentChange" style="width: 100%" v-loading="loading">
        <el-table-column property="id" label="编号" fixed>
        </el-table-column>
        <el-table-column property="username" label="用户名" fixed>
        </el-table-column>
        <el-table-column property="password" label="密码" fixed>
        </el-table-column>
        <el-table-column property="roleId" label="角色" fixed>
          <template slot-scope="scope">
            {{scope.row.roleId | roleFormat}}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handlePageCurrentChange" :current-page="currentPage" :page-sizes="[5, 10, 15, 20]" :page-size="limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <el-dialog :title="dialogTitle" :visible.sync="centerDialogVisible" width="30%" center v-loading="dialogLoading">
      <div class="dialogMain">
        <el-form label-width="80px" :model="userData">
          <el-form-item label="账号">
            <el-input v-model="userData.username"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="userData.password" show-password></el-input>
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="userData.roleId" placeholder="请选择">
              <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel()">取 消</el-button>
        <el-button type="primary" @click="dialogTitle == '新增'? doAdd() : doUpd()">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="分配权限" :visible.sync="assignDialogVisible" width="30%" center>
      <div class="dialogMain">
        <el-tree :data="treeMenuItems" show-checkbox default-expand-all node-key="id" ref="tree" highlight-current v-loading="treeLoading" :check-strictly="true" :props="defaultProps" :default-checked-keys="numArray">
        </el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignDialogCancel()">取 消</el-button>
        <el-button type="primary" @click="doAssign()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
var that;
import axios from 'axios'
export default {
  data() {
    return {
      btns: [],
      id: null,
      user: {},
      data: [],
      currentRow: null,
      currentPage: 1,
      limit: 5,
      total: 0,
      loading: true,
      fName: '',
      dialogTitle: '',
      dialogLoading: true,
      centerDialogVisible: false,
      userData: {
        id: 0,
        username: null,
        password: null,
        roleId: null
      },
      roleList: [],
      treeMenuItems: [],
      assignDialogVisible: false,
      permissionList: [],
      treeLoading: true,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      numArray: []
    };
  },
  beforeCreate() {
    that = this;
  },
  filters: {
    roleFormat: function (val) {
      switch (val) {
        case 1:
          return '超级管理员';
        case 10:
          return '管理员';
        case 11:
          return '用户';
      }
    }
  },
  methods: {
     initBtnData() {
      let url = '/api/button/selectBtn';
      url += '/' + this.id;
      axios.get(url).then(res => {

        this.btns = res.data.data;
        let btns = this.btns;
        this.btns = btns;
      }).catch(err => {
        this.$message.error("发生未知错误，请联系系统管理员！");
      })
    },
     initListData() {
      let url = '/api/user/selectList'
      url += '/' + this.currentPage;
      url += '/' + this.limit;
      axios.get(url).then(res => {
        this.total = res.data.data.total;
        this.data = res.data.data.records;
        this.loading = false;
      }).catch(error => {
        this.$message.error("发生未知错误，请联系系统管理员！");
        this.loading = true;
      })
    },
     initRoleListData() {
      const url = '/api/role/selectList';
      axios.get(url).then(res => {
        this.dialogLoading = false;
        this.roleList = res.data.data;
      }).catch(err => {
        this.dialogLoading = true;
        this.$message.error("发生未知错误，请联系系统管理员！");
      })
    },
    cancel() {
      this.dialogLoading = true;
      this.dialogTitle = '';
      this.centerDialogVisible = false;
      this.userData.username = null;
      this.userData.id = null;
      this.userData.password = null;
      this.userData.roleId = null;
      this.roleList = [];
    },
    assignDialogCancel() {
      this.treeMenuItems = [];
      this.assignDialogVisible = false;
      this.permissionList = [];
      this.treeLoading = true;
    },
    toDo(val) {
      if (val.indexOf('新增') > -1) {
        this.add();
        return;
      }
      if (val.indexOf('修改') > -1) {
        this.upd();
        return;
      }
      if (val.indexOf('删除') > -1) {
        this.del();
        return;
      }
      if (val.indexOf('分配权限') > -1) {
        this.assign();
        return;
      }
    },
    add() {
      this.initRoleListData();
      this.dialogTitle = '新增';
      this.centerDialogVisible = true;
    },
    doAdd() {
      const url = '/api/user/add';
      const data = this.userData;
      axios.put(url, data).then(res => {
        const resltCode = res.data.code;
        if (resltCode == 0) {
          this.$message.success(res.data.message);
        } else {
          this.$message.error(res.data.message);
        }

        this.initListData();
      }).catch(err => {
        this.$message.error("发生未知错误，请联系系统管理员！");
      });
      this.cancel();
    },
    upd() {
      if (this.currentRow == null) {
        this.$message.error("请选择一条数据！");
      } else {
        this.initRoleListData();
        const id = this.currentRow.id;
        this.initUpdateUserData(id);
        this.dialogTitle = '修改';
        this.centerDialogVisible = true;
      }
    },
    initUpdateUserData(id) {
      const url = '/api/user/selectOne/' + id;
      axios.get(url).then(res => {
        this.dialogLoading = false;
        this.userData = res.data.data;
      }).catch(err => {
        this.dialogLoading = true;
        this.$message.error("发生未知错误，请联系系统管理员！");
      })
    },
    doUpd() {
      const url = '/api/user/upd'
      const data = this.userData;
      axios.put(url, data).then(res => {
        const resltCode = res.data.code;
        if (resltCode == 0) {
          this.$message.success(res.data.message);
        } else {
          this.$message.error(res.data.message);
        }
        this.initListData();
      }).catch(err => {
        this.$message.error("发生未知错误，请联系系统管理员！");
      });
      this.cancel();
    },
    del() {
      if (this.currentRow == null) {
        this.$message.error("请选择一条数据！");
      } else {
        const id = this.currentRow.id;
        this.$confirm('确定删除用户：' + this.currentRow.username + '吗？', '删除用户', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.doDel(id);
        }).catch(() => {
          this.$message({
          message: '已取消删除！',
          type: 'warning'
        });
        })

      }
    },
    doDel(id) {
      const url = '/api/user/del/' + id;
      axios.get(url).then(res => {
        const resltCode = res.data.code;
        if (resltCode == 0) {
          this.$message.success(res.data.message);
        } else {
          this.$message.error(res.data.message);
        }
        this.initListData();
      }).catch(err => {
        this.$message.error("发生未知错误，请联系系统管理员！");
      });
      this.cancel();
    },
    assign() {
      if (this.currentRow == null) {
        this.$message.error("请选择一条数据！");
      } else {
        this.assignDialogVisible = true;
        this.initPermissionListData();
        this.initTreeMenuItemList()
        this.treeLoading = false;
        this.$nextTick(() => {
          this.CheckedKeys();
        });
      }
    },
    doAssign() {
      const array = this.$refs.tree.getCheckedNodes();
      let idArray = new Array();
      for (var i = 0; i < array.length; i++) {
        idArray.push(array[i].id);
      }
      const arrStr = idArray.toString();
      const url = '/api/user/doAssign/' + this.currentRow.id + '/' + arrStr;
      axios.put(url, idArray).then(res => {
        const resultCode = res.data.code;
        if (resultCode == 0) {
          this.$message.success(res.data.message);
        } else {
          this.$message.error(res.data.message);
        }

      }).catch(err => {
        this.dialogLoading = true;
        this.$message.error("发生未知错误，请联系系统管理员！");
      })
      this.assignDialogCancel();
    },
    async initTreeMenuItemList() {
      const url = '/api/menuItem/selectList'
      axios.get(url).then(res => {
        this.treeMenuItems = res.data.data;
      }).catch(err => {
        this.$message.error("发生未知错误，请联系系统管理员！");
      })
    },
    async initPermissionListData() {
      const id = this.currentRow.id;
      const url = '/api/user/selectPermission/' + id;
      axios.get(url).then(res => {
        this.permissionList = res.data.data;
        this.defaultCheck();
      }).catch(err => {
        this.$message.error("发生未知错误，请联系系统管理员！");
      })
    },
    setCurrent(row) {
      if (row == this.currentRow) {
        row = null;
        this.$refs.singleTable.setCurrentRow(null);
      } else {
        this.$refs.singleTable.setCurrentRow(row);
      }
    },
    Deselect() {
      this.$refs.singleTable.setCurrentRow(null);
    },
    handleCurrentChange(val) {
      if (val == this.currentRow) {
        this.currentRow = null;
      } else {
        this.currentRow = val;
      }

    },
    handleSizeChange(val) {
      this.limit = val;
      this.initListData();
    },
    handlePageCurrentChange(val) {
      console.log(val)
      this.currentPage = val;
      this.initListData();
    },
    CheckedKeys() {
      const list = this.permissionList;
      let array = new Array();
      for (var i = 0; i < list.length; i++) {
        array.push(list[i].menuId);
      }
      this.numArray = array;

      this.defaultCheck();
    },
    defaultCheck() {
      const list = this.permissionList;
      let array = new Array();
      for (var i = 0; i < list.length; i++) {
        array.push(list[i].menuId);
      }
      this.$refs.tree.setCheckedKeys(array);
    }
  },
  mounted() {
    this.id = this.$route.params.id;
    this.initBtnData();
    this.initListData();
  },
  computed: {
    disable() {
      if (this.currentRow == null) {
        return true;
      } else {
        return false;
      }
    }
  }
}
</script>
<style>
.box-card {
  margin: 25px;
}
.dialogMain {
  text-align: center;
  margin: 0 auto;
}
</style>
