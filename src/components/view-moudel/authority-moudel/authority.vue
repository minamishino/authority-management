<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
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
        <el-table-column property="name" label="菜单名称" fixed>
        </el-table-column>
        <el-table-column property="path" label="菜单地址">
          <template slot-scope="scope">
            {{scope.row.path == ''|| scope.row.path == null ? '空':scope.row.path}}
          </template>
        </el-table-column>
        <el-table-column property="pid" label="父级菜单">
          <template slot-scope="scope">
            {{scope.row.pid | pidFormat}}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handlePageCurrentChange" :current-page="currentPage" :page-sizes="[5, 10, 15, 20]" :page-size="limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <el-dialog :title="dialogTitle" :visible.sync="centerDialogVisible" width="30%" center v-loading="dialogLoading">
      <div class="dialogMain">
        <el-form label-width="100px" :model="menuItemData">
          <el-form-item label="菜单编号" v-show="!show">
            <el-input v-model="menuItemData.id" :disabled="!show"></el-input>
          </el-form-item>
          <el-form-item label="菜单名称">
            <el-input v-model="menuItemData.name"></el-input>
          </el-form-item>
          <el-form-item label="父菜单">
            <el-select v-model="menuItemData.pid" placeholder="请选择">
              <el-option :value="0" label="根菜单"></el-option>
              <el-option v-for="item in allMenuItemList" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否为按钮">
            <el-switch v-model="menuItemData.status" active-color="#409EFF" inactive-color="#909399" active-text="按钮" inactive-text="菜单">
            </el-switch>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel()">取 消</el-button>
        <el-button type="primary" @click="dialogTitle == '新增'? doAdd() : doUpd()">确 定</el-button>
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
      data: [],
      currentRow: null,
      currentPage: 1,
      limit: 5,
      total: 0,
      loading: true,
      dialogTitle: '',
      dialogLoading: true,
      centerDialogVisible: false,
      menuItemData: {
        id: null,
        name: null,
        path: null,
        pid: null,
        icon: null,
        button: null,
        status: null
      },
      allMenuItemList: {},
      show: true,
      value: '',
    };
  },
  beforeCreate() {
    that = this;
  },
  filters: {
    pidFormat: function (val) {
      if (val == 0) {
        return "根菜单"
      } else {
        const list = that.allMenuItemList;
        for (var i = 0; i < list.length; i++) {
          if (list[i].id == val) {
            return list[i].name;
          }
        }
      }
    }
  },
  methods: {
    initBtnsData() {
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
      let url = '/api/menuItem/selectList'
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
    initAllMenuItemListData() {
      let url = '/api/menuItem/selectAll'
      axios.get(url).then(res => {
        this.allMenuItemList = res.data.data;
      }).catch(error => {
        this.$message.error("发生未知错误，请联系系统管理员！");
      })
    },
    cancel() {
      this.dialogLoading = true;
      this.dialogTitle = '';
      this.centerDialogVisible = false;
      this.menuItemData.name = null;
      this.menuItemData.id = null;
      this.menuItemData.path = null;
      this.menuItemData.pid = null;
      this.menuItemData.icon = null;
      this.menuItemData.button = null;
      this.menuItemData.status = null;
      this.show = true;
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
      this.dialogTitle = '新增';
      this.treeLoading = false;
      this.centerDialogVisible = true;
      this.show = true;
    },
    doAdd() {
      const url = '/api/menuItem/add'
      const data = this.menuItemData;
      data.status = data.status === true ? 1 : 0;
      axios.put(url, data).then(res => {
        if (res.data.code == 0) {
          this.$message.success(res.data.message);
        } else {
          this.$message.error(res.data.message);
        }
        this.initListData();
      }).catch(error => {
        this.$message.error("发生未知错误，请联系系统管理员！");
      })
      this.cancel();
    },
    upd(){
      if (this.currentRow == null) {
        this.$message.error("请选择一条数据！");
      } else {
        const id = this.currentRow.id;
        this.show = false;
        this.initUpdateRoleData(id);
        this.dialogTitle = '修改';
        this.centerDialogVisible = true;
      }
    },
    initUpdateRoleData(id){
      const url = '/api/menuItem/selectOne/'+id;
      axios.get(url).then(res => {
        this.menuItemData = res.data.data;
      }).catch(error => {
        this.$message.error("发生未知错误，请联系系统管理员！");
      })
    },
    doUpd(){
      const data = this.menuItemData;
      data.status = data.status === true ? 1 : 0;
      const url = '/api/menuItem/upd';
      axios.put(url,data).then(res => {
        const resltCode = res.data.code;
        if (resltCode == 0) {
          this.$message.success(res.data.message);
        } else {
          this.$message.error(res.data.message);
        }
        this.initListData();
      }).catch(error => {
        this.$message.error("发生未知错误，请联系系统管理员！");
      })
      this.cancel();
    },
    del() {
      if (this.currentRow == null) {
        this.$message.error("请选择一条数据！");
      } else {
        const id = this.currentRow.id;
        this.$confirm('确定删除菜单：' + this.currentRow.name + '吗？', '删除菜单', {
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
    doDel(id){
      const url = '/api/menuItem/del/'+id;
      axios.get(url).then(res => {
        const resltCode = res.data.code;
        if (resltCode == 0) {
          this.$message.success(res.data.message);
        } else {
          this.$message.error(res.data.message);
        }
        this.initListData();
      }).catch(error => {
        this.$message.error("发生未知错误，请联系系统管理员！");
      })
      this.cancel();
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
      this.currentPage = val;
      this.initListData();
    },
  },
  mounted() {
    this.id = this.$route.params.id;
    this.initBtnsData();
    this.initListData();
    this.initAllMenuItemListData();
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
