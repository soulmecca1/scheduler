import { configureStore } from '@reduxjs/toolkit'
import { api } from './services'


// Redux store
const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }).concat(api.middleware)
})

export default store