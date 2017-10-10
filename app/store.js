import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import loggerMiddleware from 'redux-logger';
import axios from 'axios';

// ACTION NAMES
const GET_PRODUCTS = 'GET_PRODUCTS';
const GET_ORDERS = 'GET_ORDERS';
const ADD_TO_CART = 'ADD_TO_CART';
const LOGIN = 'LOGIN'
const LOGOUT = 'LOGOUT'

// ACTION CREATORS
const getProducts = (products) => {
  return {
    type: GET_PRODUCTS,
    products
  }
};

const getOrders = (orders) => {
  return {
    type: GET_ORDERS,
    orders
  }
};

const login = user => ({ type: LOGIN, user })
const logout = () => ({ type: LOGOUT })

// THUNKS
export const fetchProducts = () => {
  return dispatch => {
    return axios.get('/api/products')
      .then(res => res.data)
      .then(products => dispatch(getProducts(products)))
      .catch(err => console.log(err.message))
  }
};

export const fetchOrders = () => {
  return dispatch => {
    return axios.get('/api/orders')
      .then(res => res.data)
      .then(orders => dispatch(getOrders(orders)))
      .catch(err => console.log(err.message))
  }
};

export const updateCartItem = (product, quantity) => dispatch =>
  axios.put(`/api/orders/products/${product.id}`, { quantity, price: product.price })
    .then(() => dispatch(fetchOrders()))
    .catch(err => console.log(err.message))

export const checkOut = () => dispatch =>
  axios.put('/api/orders/check-out')
    .then(() => dispatch(fetchOrders()))
    .catch(err => console.log(err.message))

export const checkSession = () => dispatch =>
  axios.get('/api/sessions')
    .then(res => dispatch(login(res.data)))
    .then(() => dispatch(fetchOrders()))
    .catch(err => console.log(err.message))

export const loginUser = (email, password) => dispatch =>
  axios.put('/api/sessions', { email, password })
    .then(() => dispatch(checkSession()))
    .catch(err => console.log(err.message))

export const logoutUser = () => dispatch =>
  axios.delete('/api/sessions')
    .then(() => dispatch(logout()))
    .then(() => dispatch(getOrders([])))
    .catch(err => console.log(err.message))

export const registerUser = userData => dispatch =>
  axios.post('/api/users', userData)
    .then(res => dispatch(loginUser(res.data)))
    .catch(err => console.log(err.message))

// INITIAL STATE
const initialState = {
  products: [],
  orders: [],
  currentUser: {}
};

// REDUCER
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return Object.assign({}, state, { currentUser: action.user })
    case LOGOUT:
      return Object.assign({}, state, { currentUser: {} })
    case GET_PRODUCTS:
      return Object.assign({}, state, { products: action.products });
    case GET_ORDERS:
      return Object.assign({}, state, {orders: action.orders})
    default:
      return state;
  }
};

const store = createStore(reducer, applyMiddleware(thunkMiddleware, loggerMiddleware));
export default store;
