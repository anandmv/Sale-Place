import asyncLoader from './utils/asyncLoader'

let routes = [
  { path: '/',component: asyncLoader(() => import('./pages/ItemList')), exact: true},
  { path: '/item/create',component: asyncLoader(() => import('./pages/CreateItem')), exact: true},
  { path: '/purcahses',component: asyncLoader(() => import('./pages/ItemPurchased')), exact: true},
  { path: '/item/:id',component: asyncLoader(() => import('./pages/ItemDetails'))},
  { path: '*',component: asyncLoader(() => import('./pages/ItemList'))},
]
export default routes
