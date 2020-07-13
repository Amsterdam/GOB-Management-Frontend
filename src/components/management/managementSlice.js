import { createSlice } from '@reduxjs/toolkit';

export const managementSlice = createSlice({
    name: 'management',
    initialState: {
        catalogCollections: {},
        catalogs: [],
        catalog: "",
        collections: [],
        catalogOnlyActions: ["Prepare", "Export Test"],
        actions: [],
        action: "",
        productActions: ["Export", "Relate"],
        product: ""
    },
    reducers: {
        setCatalogCollections: (state, action) => {
            state.catalogCollections = action.payload
            state.catalogs = Object.keys(state.catalogCollections)
        },

        setCatalog: (state, action) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the Immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            const catalog = action.payload
            if (Object.keys(state.catalogCollections).includes(catalog)) {
                state.catalog = catalog;
                state.collections = [];
                let actions = ["Import", "Relate", "Export", "Dump", "Export Test"]
                state.actions = catalog === "brk" ? ["Prepare", ...actions] : actions
                state.product = "";
            }
        },

        setCollections: (state, action) => {
            const { catalog, catalogCollections } = state
            const validCollections = catalogCollections[catalog] || []
            const collections = action.payload
            state.collections = collections.filter(collection => validCollections.includes(collection))
        },

        setAction: (state, _action) => {
            const action = _action.payload
            if (state.actions.includes(action)) {
                state.action = action;
                state.product = ""
                if (state.catalogOnlyActions.includes(action)) {
                    state.collections = []
                }
            }
        },

        setProduct: (state, _action) => {
            const { action } = state
            const product = _action.payload
            if (state.productActions.includes(action)) {
                state.product = product
            }

        }
    },
});

export const { setCatalogCollections, setCatalog, setCollections, setAction, setProduct } = managementSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectCatalog = state => state.management.catalog;

export default managementSlice.reducer;
