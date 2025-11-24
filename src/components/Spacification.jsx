import React from 'react';

const Spacification = ({ product }) => {
    const specs = [
        { label: 'Brand', value: 'Sarker Shop' },
        { label: 'Model', value: '2026 Edition' },
        { label: 'Material', value: 'Premium Cotton Blend' },
        { label: 'Size', value: 'S, M, L, XL, XXL' },
        { label: 'Color', value: 'Navy Blue, Charcoal, Olive' },
        { label: 'Care', value: 'Machine wash cold, tumble dry low' },
    ];

    return (
        <div className="max-w-3xl mx-auto p-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide">
                Product Specification
            </h2>
            <div className="overflow-hidden rounded-xl border border-purple-500">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gradient-to-r from-purple-500 to-purple-700 text-white">
                            <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Feature</th>
                            <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {specs?.map((item, idx) => (
                            <tr
                                key={idx}
                                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    } hover:bg-purple-200 transition-colors duration-200`}
                            >

                                <td className="px-6 py-4 font-medium text-gray-700 border-r border-gray-200">
                                    {item.label}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{item.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Spacification;
