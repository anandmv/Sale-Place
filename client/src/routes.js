import asyncLoader from './utils/asyncLoader'

let routes = [
  { path: '/',component: asyncLoader(() => import('./pages/ItemList')), exact: true},
  { path: '/item/create',component: asyncLoader(() => import('./pages/ItemForm')), exact: true},
  { path: '/item/:id/edit',component: asyncLoader(() => import('./pages/ItemForm'))},
  { path: '/purcahses',component: asyncLoader(() => import('./pages/ItemPurchased')), exact: true},
  { path: '/item/:id',component: asyncLoader(() => import('./pages/ItemDetails'))},
  { path: '*',component: asyncLoader(() => import('./pages/ItemList'))},
]
export default routes
