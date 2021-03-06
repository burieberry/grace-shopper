import axios from 'axios';
import { fetchProducts } from './products';

export const writeReview = (reviewData) => dispatch =>
  axios.post(`/api/reviews/${reviewData.productId}`, reviewData)
    .then(() => dispatch(fetchProducts()))

const initialState = {}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default reducer;
