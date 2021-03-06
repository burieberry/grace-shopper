const conn = require('./conn');
const Sequelize = conn.Sequelize;

const Order = conn.define('order', {
  address: {
    type: Sequelize.STRING,
    validate: { notEmpty: { msg: 'Address is required.' }}
  },
  paymentInfo: {
    type: Sequelize.STRING,
    validate: { notEmpty: { msg: 'Payment info is required.' }}
  },
  isCart: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: Sequelize.STRING,
    validate: {
      is: /CREATED|PROCESSING|SHIPPED|DELIVERED|CANCELLED/g
    }
  },
});

// Class Methods:

Order.findOrders = function(userId) {
  return this.findAll({
    where: { userId },
    include: [{ model: conn.models.lineitem, include: [ conn.models.product ] }],
    order: [[ conn.models.lineitem, 'createdAt', 'ASC' ]]
  })
};

Order.findOrder = function(id) {
  return this.findOne({ 
    where: { id, isCart: false }, 
    include: [ 
      { model: conn.models.lineitem, include: [ conn.models.product ] }, 
      { model: conn.models.user, attributes: [ 'email', 'isGuest' ] } 
    ]  
  })
};

Order.findFiltered = function(userId, status) {
  return this.findAll({ where: { userId, status }});
};

Order.findCart = function(userId) {
  return this.findOne({
    where: { isCart: true, userId },
    include: [{
      model: conn.models.lineitem,
      include: [ conn.models.product ]
    }]
  })
    .then(order => {
      if (order) return order;
    })
};

Order.createCart = function(userId) {
  return this.create({ userId })
}

Order.checkOut = function(userId, body) {
  // TODO: guest does not have userId. ask guest to create an account.
  return this.findCart(userId)
    .then(order => {
      const { address, paymentInfo } = body;
      return order.changeCartToOrder(address, paymentInfo);
    })
    .then(order => this.findOrder(order.id))
};

Order.guestCheckOut = function(sessionCartItems, checkoutData) {
  const User = conn.models.user
  const { email, address, paymentInfo } = checkoutData
  return User.findOne({ where: { email } })
    .then(user => {
      if (user) return user;
      return User.createGuest({ email })
    })
    .then(user => User.logIn(user.email, user.password, sessionCartItems))
    .then(user => this.checkOut(user.id, { address, paymentInfo }))
}

Order.updateCart = function(userId, productId, updateData) {
  return this.findCart(userId)
    .then(order => {
      let lineItem = order.lineitems && order.lineitems.find(li => li.productId === productId) ||
        conn.models.lineitem.build({ orderId: order.id, productId });

      Object.assign(lineItem, updateData);
      return lineItem.save();
    })
};

Order.removeLineItem = function(orderId, id) {
  return conn.models.lineitem.destroy({ where: { id, orderId }});
};

Order.verifyPurchase = function(userId, productId) {
  return this.findAll({
    where: { userId },
    include: [ conn.models.lineitem ]
  })
    .then(orders => {
      orders = orders.filter(order => !order.isCart)

      // flatten
      let purchases = []
      orders.forEach(order => purchases.push(JSON.parse(JSON.stringify(order.lineitems))[0]))

      // search
      return purchases.find(lineitem => lineitem.productId == productId)
    })
}

// Instance Methods:

Order.prototype.changeCartToOrder = function(address, paymentInfo) {
  // if number of items in cart is empty, return error
  if (!this.lineitems.length) return Promise.reject('Cart is empty');

  // call inventory reduction, then save
  return Promise.all(
    this.lineitems.map(li => (
      conn.models.product.checkInventory(li.productId, -1 * li.quantity)
    ))
  )
    .then(() => Promise.all(
      this.lineitems.map(li => (
        conn.models.product.updateInventoryBy(li.productId, -1 * li.quantity)
      ))
    ))
    .then(function() {
      // if falsy, set to empty string to use Sequelize validation error
      Object.assign(this, {
        address: address || '',
        paymentInfo: paymentInfo || '',
        isCart: false,
        status: 'CREATED' });
      return this.save();
    }.bind(this))
};

// admin methods:

Order.findAllOrders = function() {
  return this.findAll({
    where: { isCart: false },
    include: [
      { model: conn.models.lineitem, include: [ conn.models.product ] },
      { model: conn.models.user }
    ],
    order: [[ conn.models.lineitem, 'createdAt', 'ASC' ]]
  })
};

// status change methods (more secure than using update)
// TODO: write a getStatuses method, will return statuses: [ 'CREATED', 'PROCESSING' ] etc

Order.changeStatus = function(orderId, status) {
  return this.findById(orderId)
    .then(order => {
      Object.assign(order, status)
      return order.save()
    })
}

// ******************* //

module.exports = Order;
