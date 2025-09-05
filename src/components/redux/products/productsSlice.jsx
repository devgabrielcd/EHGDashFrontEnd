import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Alterar o thunk para usar o token da sessão
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (token) => {
        const response = await fetch('http://localhost:8000/api/products', {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) {
            throw new Error('Falha ao carregar os produtos');
        }
        return response.json();
    }
);

const productsSlice = createSlice({
    name: 'products',
    initialState: {
        products: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default productsSlice.reducer;
