import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import lotService from '../../services/lotService.js';
import slotService from '../../services/slotService.js';
import SlotGrid from '../../components/parking/SlotGrid.jsx';
import InputField from '../../components/forms/InputField.jsx';
import SelectField from '../../components/forms/SelectField.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const LotsManagementPage = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  const [expandedLot, setExpandedLot] = useState(null);
  const [expandedSlots, setExpandedSlots] = useState([]);
  const [form, setForm] = useState({
    name: '', address: '', lat: '', lng: '', totalSlots: '', ratePerHour: '',
    operatingHours: { open: '06:00', close: '22:00' }, isActive: true
  });

  const fetchLots = async () => {
    try {
      const data = await lotService.getLots();
      setLots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLot) {
        await lotService.updateLot(editingLot._id, form);
      } else {
        await lotService.createLot(form);
      }
      setModalOpen(false);
      setEditingLot(null);
      fetchLots();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this parking lot?')) return;
    try {
      await lotService.deleteLot(id);
      fetchLots();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const openEdit = (lot) => {
    setEditingLot(lot);
    setForm({
      name: lot.name,
      address: lot.address,
      lat: lot.lat,
      lng: lot.lng,
      totalSlots: lot.totalSlots,
      ratePerHour: lot.ratePerHour,
      operatingHours: lot.operatingHours,
      isActive: lot.isActive
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingLot(null);
    setForm({
      name: '', address: '', lat: '', lng: '', totalSlots: '', ratePerHour: '',
      operatingHours: { open: '06:00', close: '22:00' }, isActive: true
    });
    setModalOpen(true);
  };

  const toggleExpand = async (lot) => {
    if (expandedLot === lot._id) {
      setExpandedLot(null);
      return;
    }
    setExpandedLot(lot._id);
    try {
      const slots = await slotService.getSlotsByLot(lot._id);
      setExpandedSlots(slots);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSlotUpdate = async (slot) => {
    const newType = prompt('Enter new type (regular, PWD, motorcycle, ev):', slot.type);
    if (!newType) return;
    try {
      await slotService.updateSlot(slot._id, { type: newType });
      const slots = await slotService.getSlotsByLot(expandedLot);
      setExpandedSlots(slots);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Parking Lots</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Lot
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Address</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Slots</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Rate</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot) => (
              <>
                <tr key={lot._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{lot.name}</td>
                  <td className="py-3 px-4 text-gray-600">{lot.address}</td>
                  <td className="py-3 px-4">{lot.totalSlots}</td>
                  <td className="py-3 px-4">₱{lot.ratePerHour}/hr</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${lot.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {lot.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(lot)} className="text-blue-600 hover:text-blue-700">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(lot._id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleExpand(lot)} className="text-gray-500 hover:text-gray-700">
                        {expandedLot === lot._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedLot === lot._id && (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 bg-gray-50">
                      <p className="text-sm font-medium mb-3">Slot Management</p>
                      <SlotGrid slots={expandedSlots} onSlotClick={handleSlotUpdate} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingLot ? 'Edit Lot' : 'Add Lot'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <InputField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Latitude" type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) })} required />
                <InputField label="Longitude" type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Total Slots" type="number" value={form.totalSlots} onChange={(e) => setForm({ ...form, totalSlots: parseInt(e.target.value) })} required />
                <InputField label="Rate/Hour" type="number" value={form.ratePerHour} onChange={(e) => setForm({ ...form, ratePerHour: parseFloat(e.target.value) })} required />
              </div>
              <SelectField
                label="Status"
                value={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]}
              />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="btn-primary">{editingLot ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LotsManagementPage;

