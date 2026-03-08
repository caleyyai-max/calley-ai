"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  GripVertical,
  X,
  DollarSign,
  Tag,
  FileText,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

// ---------- Types ----------

interface Modifier {
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  modifiers: Modifier[];
}

interface MenuFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  modifiers: Modifier[];
}

// ---------- Mock Data ----------

const categories = ["Appetizers", "Entrees", "Sides", "Drinks"];

const initialMenuItems: MenuItem[] = [
  // Appetizers
  {
    id: "item_01",
    name: "Bruschetta",
    description: "Toasted bread topped with diced tomatoes, garlic, basil, and olive oil.",
    price: 9.99,
    category: "Appetizers",
    available: true,
    modifiers: [{ name: "Add mozzarella", price: 2.0 }],
  },
  {
    id: "item_02",
    name: "Calamari Fritti",
    description: "Lightly fried calamari rings served with marinara sauce.",
    price: 12.99,
    category: "Appetizers",
    available: true,
    modifiers: [],
  },
  {
    id: "item_03",
    name: "Minestrone Soup",
    description: "Hearty vegetable soup with pasta and beans.",
    price: 6.99,
    category: "Appetizers",
    available: false,
    modifiers: [],
  },
  // Entrees
  {
    id: "item_04",
    name: "Margherita Pizza",
    description: "Classic pizza with San Marzano tomatoes, fresh mozzarella, and basil.",
    price: 14.99,
    category: "Entrees",
    available: true,
    modifiers: [
      { name: "Extra cheese", price: 2.5 },
      { name: "Gluten-free crust", price: 3.0 },
    ],
  },
  {
    id: "item_05",
    name: "Chicken Parmesan",
    description: "Breaded chicken breast topped with marinara and melted mozzarella, served with spaghetti.",
    price: 18.99,
    category: "Entrees",
    available: true,
    modifiers: [{ name: "Sub penne", price: 0 }],
  },
  {
    id: "item_06",
    name: "Spaghetti Bolognese",
    description: "Slow-cooked beef and pork ragu over spaghetti pasta.",
    price: 15.99,
    category: "Entrees",
    available: true,
    modifiers: [{ name: "Add meatballs", price: 4.0 }],
  },
  {
    id: "item_07",
    name: "Fettuccine Alfredo",
    description: "Creamy parmesan sauce tossed with fettuccine pasta.",
    price: 16.99,
    category: "Entrees",
    available: true,
    modifiers: [
      { name: "Add chicken", price: 4.0 },
      { name: "Add shrimp", price: 6.0 },
    ],
  },
  {
    id: "item_08",
    name: "Lasagna",
    description: "Layers of pasta, beef ragu, bechamel, and mozzarella.",
    price: 17.99,
    category: "Entrees",
    available: true,
    modifiers: [],
  },
  // Sides
  {
    id: "item_09",
    name: "Caesar Salad",
    description: "Romaine lettuce, croutons, parmesan, and Caesar dressing.",
    price: 8.99,
    category: "Sides",
    available: true,
    modifiers: [{ name: "Add grilled chicken", price: 4.0 }],
  },
  {
    id: "item_10",
    name: "Garlic Bread",
    description: "Toasted Italian bread with garlic butter and herbs.",
    price: 4.99,
    category: "Sides",
    available: true,
    modifiers: [{ name: "Add cheese", price: 1.5 }],
  },
  // Drinks
  {
    id: "item_11",
    name: "Italian Soda",
    description: "Sparkling water with your choice of flavored syrup.",
    price: 3.99,
    category: "Drinks",
    available: true,
    modifiers: [],
  },
  {
    id: "item_12",
    name: "Espresso",
    description: "Double shot of authentic Italian espresso.",
    price: 3.49,
    category: "Drinks",
    available: true,
    modifiers: [
      { name: "Extra shot", price: 1.0 },
      { name: "Oat milk", price: 0.75 },
    ],
  },
];

const emptyForm: MenuFormData = {
  name: "",
  description: "",
  price: "",
  category: categories[0],
  modifiers: [],
};

// ---------- Component ----------

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuFormData>(emptyForm);
  const [newModName, setNewModName] = useState("");
  const [newModPrice, setNewModPrice] = useState("");

  const allCategories = ["All", ...categories];

  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  const toggleAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item
      )
    );
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setNewModName("");
    setNewModPrice("");
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      modifiers: [...item.modifiers],
    });
    setNewModName("");
    setNewModPrice("");
    setShowModal(true);
  };

  const addModifier = () => {
    if (!newModName.trim()) return;
    setForm((prev) => ({
      ...prev,
      modifiers: [
        ...prev.modifiers,
        { name: newModName.trim(), price: parseFloat(newModPrice) || 0 },
      ],
    }));
    setNewModName("");
    setNewModPrice("");
  };

  const removeModifier = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      modifiers: prev.modifiers.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price) return;

    if (editingId) {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: form.name.trim(),
                description: form.description.trim(),
                price: parseFloat(form.price),
                category: form.category,
                modifiers: form.modifiers,
              }
            : item
        )
      );
    } else {
      const newItem: MenuItem = {
        id: `item_${Date.now()}`,
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        available: true,
        modifiers: form.modifiers,
      };
      setMenuItems((prev) => [...prev, newItem]);
    }

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Menu</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your menu items, categories, and modifiers.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {allCategories.map((cat) => {
          const count =
            cat === "All"
              ? menuItems.length
              : menuItems.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300"
              )}
            >
              {cat}
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                  activeCategory === cat
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-zinc-800 text-zinc-500"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Menu items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-xl border bg-zinc-900 transition-colors group",
              item.available
                ? "border-zinc-800 hover:border-zinc-700"
                : "border-zinc-800/50 opacity-60"
            )}
          >
            {/* Card body */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <GripVertical className="h-4 w-4 text-zinc-700 mt-0.5 shrink-0 cursor-grab" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100 truncate">
                      {item.name}
                    </h3>
                    <span className="text-xs text-zinc-500">
                      {item.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => openEditModal(item)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              {item.modifiers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.modifiers.map((mod, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-md bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400"
                    >
                      {mod.name}
                      {mod.price > 0 && (
                        <span className="text-zinc-500 ml-1">
                          +{formatPrice(mod.price)}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Card footer */}
            <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3">
              <span className="text-base font-bold text-zinc-100">
                {formatPrice(item.price)}
              </span>

              {/* Availability toggle */}
              <button
                onClick={() => toggleAvailability(item.id)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{
                  backgroundColor: item.available
                    ? "rgb(34 197 94 / 0.3)"
                    : "rgb(63 63 70 / 0.5)",
                }}
                title={item.available ? "Available" : "Unavailable"}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full transition-transform",
                    item.available
                      ? "translate-x-6 bg-emerald-500"
                      : "translate-x-1 bg-zinc-500"
                  )}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal content */}
          <div className="relative w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-zinc-100">
                {editingId ? "Edit Menu Item" : "Add Menu Item"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 mb-1.5">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-zinc-500" />
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Margherita Pizza"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 mb-1.5">
                  <FileText className="h-3.5 w-3.5 text-zinc-500" />
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Describe this menu item..."
                  rows={2}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-colors resize-none"
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 mb-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 mb-1.5">
                    <Tag className="h-3.5 w-3.5 text-zinc-500" />
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-colors appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modifiers */}
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">
                  Modifiers
                </label>

                {form.modifiers.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {form.modifiers.map((mod, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-2"
                      >
                        <div className="text-sm text-zinc-200">
                          {mod.name}
                          {mod.price > 0 && (
                            <span className="text-zinc-400 ml-2">
                              +{formatPrice(mod.price)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeModifier(idx)}
                          className="rounded p-1 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newModName}
                    onChange={(e) => setNewModName(e.target.value)}
                    placeholder="Modifier name"
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newModPrice}
                    onChange={(e) => setNewModPrice(e.target.value)}
                    placeholder="$0.00"
                    className="w-20 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={addModifier}
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                {editingId ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
