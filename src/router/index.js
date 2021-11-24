import Vue from 'vue'
import Router from 'vue-router'
import loginForm from './../components/login-moudel/loginForm.vue'
import home from './../components/home.vue'
import user from './../components/view-moudel/user-moudel/user.vue'
import role from './../components/view-moudel/role-moudel/role.vue'
import order from './../components/view-moudel/order-moudel/order.vue'
import commodity from './../components/view-moudel/commodity-moudel/commodity.vue'
import authority from './../components/view-moudel/authority-moudel/authority.vue'
Vue.use(Router)

const router = new Router({
  routes: [
    {path : '/',redirect : '/login'},
    {path : '/login',name : 'login', component : loginForm},
    {path : '/home' ,name : 'home' , component : home , children : [
      {path : '/home/user/:id',name : 'user' , component : user},
      {path : '/home/role/:id',name : 'role' , component : role},
      {path : '/home/order/:id',name : 'order' , component : order},
      {path : '/home/commodity/:id',name : 'commodity' , component : commodity},
      {path : '/home/authority/:id',name : 'authority' , component : authority}
    ]}
  ],
});

router.beforeEach((to , from , next) => {
  if(to.path === '/login') return next();
  const user = window.sessionStorage.getItem('user');
  if(!user) return next('/login');
  next()
})

export default router;
