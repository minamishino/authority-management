<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
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
        <el-table-column property="name" label="商品名称" fixed>
        </el-table-column>
        <el-table-column property="price" label="商品价格" fixed>
          <template slot-scope="scope">
            {{scope.row.price | priceFormat}}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handlePageCurrentChange" :current-page="currentPage" :page-sizes="[5, 10, 15, 20]" :page-size="limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <el-dialog :title="dialogTitle" :visible.sync="centerDialogVisible" width="30%" center v-loading="dialogLoading">
      <div class="dialogMain">
        <el-form label-width="100px" :model="commodityData">
          <el-form-item label="商品编号" v-show="!show">
            <el-input v-model="commodityData.id" :disabled="!show"></el-input>
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="commodityData.name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="commodityData.price"></el-input>
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
import axios from 'axios'
axios.defaults.headers.post['Content-Type'] = 'application/json';
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
      commodityData : {
        id : null,
        name : null,
        price : null
      },
      show: true,
    };
  },
  filters : {
    priceFormat : function(val){
      return val += '元'
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
      let url = '/api/commodity/selectList'
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
    cancel() {
      this.dialogLoading = true;
      this.dialogTitle = '';
      this.centerDialogVisible = false;
      this.commodityData.id = null;
      this.commodityData.name = null;
      this.commodityData.price = null;
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
      const url = '/api/commodity/add'
      const data = this.commodityData;
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
    upd() {
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
    initUpdateRoleData(id) {
      const url = '/api/commodity/selectOne/' + id;
      axios.get(url).then(res => {
        this.commodityData = res.data.data;
      }).catch(error => {
        this.$message.error("发生未知错误，请联系系统管理员！");
      })
    },
    doUpd() {
      const data = this.commodityData;
      const url = '/api/commodity/upd';
      this.data.price = parseFloat(this.data.price);
      axios.post(url, data).then(res => {
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
    doDel(id) {
      const url = '/api/commodity/del/' + id;
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
