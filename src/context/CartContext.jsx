import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import api, { BASE_URL } from "../api/client";

export const CartContext = createContext(null)

const fixImage = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    return `${BASE_URL}${img}`;
}

export const CartProvider = ({ children }) => {
    // Initialize cart from localStorage
    const [cartItem, setCartItem] = useState(() => {
        try {
            const savedCart = localStorage.getItem("cartItems");
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error parsing cart from localStorage:", error);
            return [];
        }
    });

    // Fetch cart from API on mount if logged in
    const refreshCart = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        try {
            const response = await api.get('/cart/');
            if (response.data && response.data.items) {
                const mappedItems = response.data.items.map(item => ({
                    ...item.product,
                    cart_item_id: item.id,
                    quantity: item.quantity,
                    image: fixImage(item.product.image)
                }));
                setCartItem(mappedItems);
                localStorage.setItem("cartItems", JSON.stringify(mappedItems));
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    useEffect(() => {
        refreshCart();
    }, []);

    // Save to localStorage whenever cartItem changes
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItem));
    }, [cartItem]);

    const addToCart = async (product) => {
        const token = localStorage.getItem("access_token");

        // Optimistic update
        let updatedCart;
        const itemInCart = cartItem.find((item) => item.id === product.id)

        if (itemInCart) {
            updatedCart = cartItem.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
            toast.success("Product quantity increased!")
        } else {
            updatedCart = [...cartItem, { ...product, quantity: 1, image: fixImage(product.image) }];
            toast.success("Product is added to cart!")
        }
        setCartItem(updatedCart);

        // Sync with API if logged in
        if (token) {
            try {
                const response = await api.post('/cart-items/', {
                    product_id: product.id,
                    quantity: 1
                });

                // If new item, update with cart_item_id
                if (!itemInCart && response.data) {
                    const cartItemId = response.data.id;
                    setCartItem(prev => prev.map(item =>
                        item.id === product.id ? { ...item, cart_item_id: cartItemId } : item
                    ));
                }
            } catch (error) {
                console.error("Error adding to cart:", error);
                // Optionally revert changes or show error toast
            }
        }
    }

    const updateQuantity = async (productId, action) => {
        const token = localStorage.getItem("access_token");

        // Find item to check current quantity and cart_item_id
        const item = cartItem.find(i => i.id === productId);
        if (!item) return;

        let newQuantity = item.quantity;
        if (action === "increase") {
            newQuantity = newQuantity + 1;
            toast.success("Quantity increased!");
        } else if (action === "decrease") {
            newQuantity = newQuantity - 1;
            toast.success("Quantity decreased!");
        }

        if (newQuantity < 1) return;

        // Optimistic update
        setCartItem(prev => prev.map(i =>
            i.id === productId ? { ...i, quantity: newQuantity } : i
        ));

        // API sync
        if (token && item.cart_item_id) {
            try {
                await api.put(`/cart-items/${item.cart_item_id}/`, {
                    product_id: item.id,
                    quantity: newQuantity
                });
            } catch (error) {
                console.error("Error updating quantity:", error);
            }
        }
    }

    const deleteItem = async (productId) => {
        const token = localStorage.getItem("access_token");
        const item = cartItem.find(i => i.id === productId);

        // Optimistic update
        setCartItem(prev => prev.filter(i => i.id !== productId));
        toast.success("Product removed from cart!");

        // API sync
        if (token && item?.cart_item_id) {
            try {
                await api.delete(`/cart-items/${item.cart_item_id}/`);
            } catch (error) {
                console.error("Error deleting item:", error);
            }
        }
    }

    const syncLocalCartToServer = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        try {
            const server = await api.get('/cart/');
            const serverItems = Array.isArray(server.data?.items) ? server.data.items : [];
            const serverMap = {};
            serverItems.forEach(si => {
                const pid = si.product?.id;
                if (pid != null) {
                    serverMap[pid] = { cart_item_id: si.id, quantity: si.quantity };
                }
            });
            for (const li of cartItem) {
                const pid = li.id;
                const qty = li.quantity || 1;
                if (serverMap[pid]) {
                    const current = serverMap[pid];
                    if (current.quantity !== qty) {
                        await api.put(`/cart-items/${current.cart_item_id}/`, {
                            product_id: pid,
                            quantity: qty
                        });
                    }
                } else {
                    await api.post('/cart-items/', {
                        product_id: pid,
                        quantity: qty
                    });
                }
            }
            await refreshCart();
        } catch (err) {
            console.error("Error syncing local cart to server:", err);
        }
    };

    return <CartContext.Provider value={{ cartItem, setCartItem, addToCart, updateQuantity, deleteItem, refreshCart, syncLocalCartToServer }}>
        {children}
    </CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
