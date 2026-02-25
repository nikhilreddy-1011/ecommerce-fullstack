'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AddProductPage() {
  const router = useRouter();

  const [form, setForm] = useState<{
    name: string;
    description: string;
    price: string;
    stock: string;
    category: string;
    image: any;
  }>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      formData.append('category', form.category);
      if (form.image) {
        formData.append('image', form.image);
      }

      await api.post('/products', formData,);

      toast.success('Product added successfully!');
      router.push('/seller');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-xl mx-auto bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
            required
          />

          <input
            name="price"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
            required
          />

          <input
            name="stock"
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
            required
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
            required
          />

          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={(e) =>
              setForm({ ...form, image: e.target.files?.[0] })
            }
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition rounded-lg py-2 font-semibold"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}