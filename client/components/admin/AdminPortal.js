import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetchUsers, fetchAllOrders } from '../../store'

import AdminNav from './AdminNav'
import UsersAdmin from './UsersAdmin'
import ProductsAdmin from './ProductsAdmin'
import FilterableOrdersAdmin from './FilterableOrdersAdmin'
import CategoriesAdmin from './CategoriesAdmin'
import Order from '../Order'

class AdminPortal extends Component {
  componentDidMount() {
    this.props.fetchUsers()
    this.props.fetchAllOrders()
  }

  render() {
    const { allOrders, currentUser } = this.props

    return (
      <div>
        <h3>Admin portal</h3>
        <hr/>

        <AdminNav />

        <Route path='/admin/users' component={ UsersAdmin } />
        <Route path='/admin/products' component={ ProductsAdmin } />
        <Route exact path='/admin/orders' component={ FilterableOrdersAdmin } />
        <Route exact path='/admin/categories' component={ CategoriesAdmin } />
      </div>
    )
  }
}

const mapState = ({ allOrders, currentUser }) => ({ allOrders, currentUser })
const mapDispatch = { fetchUsers, fetchAllOrders }

export default connect(mapState, mapDispatch)(AdminPortal)
