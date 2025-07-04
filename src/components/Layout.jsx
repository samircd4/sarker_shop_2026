// components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ResponsiveMenu from './ResponsiveMenu';

const Layout = () => (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
        <Header />
        <main className="flex-grow p-4 pb-20 md:pb-4">
            <Outlet /> {/* This is where nested routes will render */}
        </main>
        <Footer />
        <ResponsiveMenu />
    </div>
);

export default Layout;