import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/", prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('ecomustoken'); // Retrieve the token from local storage
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getOrderByUser: builder.query({
      query: () => ({
        url: `order/orderbyuser`,
        method: 'GET'
      })
    }),
    getOrderById: builder.query({
      query: (id) => ({
        url: `order/${id}`,
        method: 'GET'
      })
    }),
    postOrder: builder.mutation({
      query: (data) => ({
        url: `order`,
        method: 'POST',
        body: data
      })
    }),
    getRecommendations: builder.query({
      query: (productId) => ({
        url: `order/recommendations/${productId}`,
        method: 'GET'
      })
    }),
  }),
})

export const { usePostOrderMutation, useGetOrderByUserQuery, useGetOrderByIdQuery, useGetRecommendationsQuery } = orderApi