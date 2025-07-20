import React, { useState, useEffect } from 'react';
import { Download, Plus, Trash2, Upload, FileText, Save, RefreshCw } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import './App.css'; // Assuming you have a CSS file for styles

const InvoiceGenerator = () => {
  // Company Info State
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    logo: null
  });

  // Client Info State
  const [clientInfo, setClientInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  // Invoice Metadata
  const [invoiceData, setInvoiceData] = useState({
    number: 'INV-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    terms: ''
  });

  // Items State
  const [items, setItems] = useState([
    { id: 1, name: '', quantity: 1, price: 0, gst: 18 }
  ]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('invoiceData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setCompanyInfo(parsed.companyInfo || companyInfo);
      setClientInfo(parsed.clientInfo || clientInfo);
      setInvoiceData(parsed.invoiceData || invoiceData);
      setItems(parsed.items || items);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const dataToSave = {
      companyInfo,
      clientInfo,
      invoiceData,
      items
    };
    localStorage.setItem('invoiceData', JSON.stringify(dataToSave));
  }, [companyInfo, clientInfo, invoiceData, items]);

  // Calculate totals
  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.price;
    const gstAmount = (subtotal * item.gst) / 100;
    return subtotal + gstAmount;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotalGST = () => {
    return items.reduce((sum, item) => {
      const subtotal = item.quantity * item.price;
      return sum + (subtotal * item.gst) / 100;
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalGST();
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyInfo({ ...companyInfo, logo: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new item
  const addItem = () => {
    const newItem = {
      id: items.length + 1,
      name: '',
      quantity: 1,
      price: 0,
      gst: 18
    };
    setItems([...items, newItem]);
  };

  // Remove item
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Update item
  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Generate PDF
  const generatePDF = () => {
    const element = document.getElementById('invoice-preview');
    const opt = {
      margin: 0.5,
      filename: `Invoice-${invoiceData.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    // Note: In a real app, you would use html2pdf library
    // For demo purposes, we'll just show an alert
    // alert('PDF generation feature would work with html2pdf.js library in production');
    html2pdf().from(element).set(opt).save();

  };

  // Reset form
  const resetForm = () => {
    setCompanyInfo({ name: '', address: '', phone: '', email: '', logo: null });
    setClientInfo({ name: '', address: '', phone: '', email: '' });
    setInvoiceData({
      number: 'INV-001',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      terms: ''
    });
    setItems([{ id: 1, name: '', quantity: 1, price: 0, gst: 18 }]);
    localStorage.removeItem('invoiceData');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={resetForm}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={generatePDF}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Company Information</h2>
              
              {/* Logo Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {companyInfo.logo && (
                    <img src={companyInfo.logo} alt="Logo" className="h-12 w-12 object-contain" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="company@example.com"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Company Address"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Client Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Client Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="client@example.com"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Client Address"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            {/* Invoice Metadata */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Invoice Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceData.number}
                    onChange={(e) => setInvoiceData({ ...invoiceData, number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceData.date}
                    onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Items</h2>
                <button
                  onClick={addItem}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST%</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Item name"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            min="1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.gst}
                            onChange={(e) => updateItem(item.id, 'gst', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          ₹{calculateItemTotal(item).toFixed(2)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Additional Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Additional notes..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                  <textarea
                    value={invoiceData.terms}
                    onChange={(e) => setInvoiceData({ ...invoiceData, terms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Terms and conditions..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Invoice Preview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Invoice Preview</h2>
            
            <div id="invoice-preview" className="bg-white p-8 border-2 border-gray-200 rounded-lg">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4">
                  {companyInfo.logo && (
                    <img src={companyInfo.logo} alt="Company Logo" className="h-16 w-16 object-contain" />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{companyInfo.name || 'Your Company'}</h1>
                    <p className="text-gray-600">{companyInfo.address}</p>
                    <p className="text-gray-600">{companyInfo.phone}</p>
                    <p className="text-gray-600">{companyInfo.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold text-blue-600">INVOICE</h2>
                  <p className="text-gray-600 mt-2">#{invoiceData.number}</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                  <p className="text-gray-800 font-medium">{clientInfo.name || 'Client Name'}</p>
                  <p className="text-gray-600">{clientInfo.address}</p>
                  <p className="text-gray-600">{clientInfo.phone}</p>
                  <p className="text-gray-600">{clientInfo.email}</p>
                </div>
                <div className="text-right">
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Invoice Date: </span>
                      <span className="font-medium">{invoiceData.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Due Date: </span>
                      <span className="font-medium">{invoiceData.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Item</th>
                      <th className="border border-gray-200 px-4 py-2 text-center">Qty</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Price</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">GST%</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="border border-gray-200 px-4 py-2">{item.name || 'Item Name'}</td>
                        <td className="border border-gray-200 px-4 py-2 text-center">{item.quantity}</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">₹{item.price.toFixed(2)}</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">{item.gst}%</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">₹{calculateItemTotal(item).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total GST:</span>
                    <span className="font-medium">₹{calculateTotalGST().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-bold text-blue-600">₹{calculateGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              {(invoiceData.notes || invoiceData.terms) && (
                <div className="border-t pt-6 space-y-4">
                  {invoiceData.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{invoiceData.notes}</p>
                    </div>
                  )}
                  {invoiceData.terms && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{invoiceData.terms}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;