// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Account from './pages/Account';
import OrderSuccess from './pages/OrderSuccess';
import CategoryPage from './pages/CategoryPage';
import Dashboard from './pages/Dashboard';



const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetails />} />
                <Route path="categories" element={<CategoryPage />} />
                <Route path="category/:slug" element={<CategoryPage />} />
                <Route path="brand/:slug" element={<CategoryPage />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="contact" element={<Contact />} />
                <Route path="account" element={<Account />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="order-success" element={<OrderSuccess />} />
            </Route>
        </Routes>
    </Router>
);

export default App;