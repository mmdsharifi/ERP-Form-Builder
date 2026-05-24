import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronUp,
  ChevronDown,
  Save, 
  MoreHorizontal, 
  Type, 
  Hash, 
  List, 
  CheckSquare, 
  Database,
  ArrowRight,
  LayoutGrid,
  Settings,
  Table,
  LayoutTemplate,
  Link2,
  Plus,
  X,
  Maximize2
} from 'lucide-react';

import { FormPanel } from './components/FormPanel';
import { GridTable } from './components/GridTable';
import { DraggableItem, PropertyField, ToggleSwitch } from './components/UI';

// --- MOCK DATA ---
const entityDictionary = {
  'sales_process': { 
    name: 'روند فروش', 
    fields: [{ id: 'f_main_1', type: 'comp-text', label: 'عنوان روند', required: true }] 
  },
  'sales_stages': { 
    name: 'مراحل فروش', 
    fields: [
      { id: 'c_1', name: 'نام مراحل', label: 'نام مراحل', type: 'comp-text', required: true },
      { id: 'c_2', name: 'احتمال موفقیت', label: 'احتمال موفقیت', type: 'comp-number', required: true },
      { id: 'c_3', name: 'توضیحات تکمیلی', label: 'توضیحات', type: 'comp-text', required: false }
    ] 
  },
  'stage_info': {
    name: 'اطلاعات مرحله',
    fields: [
       { id: 's_1', name: 'توضیحات تکمیلی', label: 'توضیحات تکمیلی', type: 'comp-text', required: false }
    ]
  },
  'key_info': {
    name: 'اطلاعات کلیدی',
    fields: [
       { id: 'k_1', name: 'نام فیلد', label: 'نام فیلد', type: 'comp-text', required: true },
       { id: 'k_2', name: 'اجباری', label: 'اجباری', type: 'comp-check', required: false }
    ]
  }
};

const initialGridData = [
  { id: 1, name: 'داده نمونه ۱', probability: '10' }
];

export default function App() {
  // --- STATE MANAGEMENT ---
  // State for grouping fields inside the main panel
  const [mainGroups, setMainGroups] = useState([
    { id: 'g_base', name: 'اطلاعات پایه', columns: 2, fields: [] as any[] }
  ]);

  const [boundMainEntity, setBoundMainEntity] = useState('');
  const [mainPanelName, setMainPanelName] = useState('اطلاعات اصلی');

  // Stack for Drill-down navigation. Root is level 1.
  const [viewStack, setViewStack] = useState<any[]>([{ id: 'root', type: 'main', title: 'اطلاعات اصلی' }]);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  const [level2Tabs, setLevel2Tabs] = useState<any[]>([
    {
      id: 'l2_tab_1',
      title: 'اقلام',
      boundEntity: '',
      viewType: 'grid',
      gridColumns: [],
      groups: [{ id: 'l2g_base_1', name: 'اطلاعات پایه', columns: 2, fields: [] }],
      gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
    }
  ]);
  const [activeL2TabId, setActiveL2TabId] = useState('l2_tab_1');

  const updateActiveL2Tab = (updater: (tab: any) => any) => {
    setLevel2Tabs(tabs => tabs.map(t => t.id === activeL2TabId ? updater(t) : t));
  };

  const [level3Tabs, setLevel3Tabs] = useState<any[]>([
    {
      id: 'tab_1',
      title: 'اطلاعات',
      boundEntity: '',
      viewType: 'form',
      gridColumns: [],
      groups: [{ id: 'l3g_base_1', name: 'اطلاعات پایه', columns: 2, fields: [] }],
      gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab_1');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);

  const updateActiveTab = (updater: (tab: any) => any) => {
    setLevel3Tabs(tabs => tabs.map(t => t.id === activeTabId ? updater(t) : t));
  };

  const currentView = viewStack[viewStack.length - 1];
  const isRoot = viewStack.length === 1;

  // --- HANDLERS ---
  const handleDrillDown = (row: any) => {
    const activeTab = level3Tabs.find(t => t.id === activeTabId) || level3Tabs[0];
    setViewStack([...viewStack, { id: row.id, type: 'detail', title: row.name, probability: row.probability }]);
    setSelectedElement({ ...activeTab, id: `l3-panel-${activeTab.id}`, type: 'container-l3-panel', label: activeTab.title, _tabId: activeTab.id, _context: 'l3' });
  };

  const handleBack = () => {
    if (viewStack.length > 1) {
      const newStack = viewStack.slice(0, -1);
      setViewStack(newStack);
      if (newStack.length === 1) {
        const activeTab = level2Tabs.find(t => t.id === activeL2TabId) || level2Tabs[0];
        setSelectedElement({ ...activeTab, id: `l2-panel-${activeTab.id}`, type: 'container-l2-panel', label: activeTab.title, _tabId: activeTab.id, _context: 'l2' });
      } else {
        const activeTab = level3Tabs.find(t => t.id === activeTabId) || level3Tabs[0];
        setSelectedElement({ ...activeTab, id: `l3-panel-${activeTab.id}`, type: 'container-l3-panel', label: activeTab.title, _tabId: activeTab.id, _context: 'l3' });
      }
    }
  };

  const handleBindEntity = (zone: string, entityKey: string) => {
    if (zone === 'main') {
      setBoundMainEntity(entityKey);
      if (entityKey && (entityDictionary as any)[entityKey]) {
        setMainGroups([
          { id: 'g_base', name: 'اطلاعات پایه', columns: 2, fields: (entityDictionary as any)[entityKey].fields }
        ]);
      } else {
        setMainGroups([
          { id: 'g_base', name: 'اطلاعات پایه', columns: 2, fields: [] }
        ]);
      }
    }
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStartSidebar = (e: React.DragEvent, itemType: string) => {
    e.dataTransfer.setData('componentType', itemType);
  };

  const handleDrop = (e: React.DragEvent, targetZone: string, groupId: string | null = null, targetFieldId: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();

    const componentType = e.dataTransfer.getData('componentType');
    const draggedFieldData = e.dataTransfer.getData('draggedField');

    if (draggedFieldData && (targetZone === 'main' || targetZone === 'l2-form' || targetZone === 'l3-form') && groupId) {
      const { fieldId, sourceGroupId, sourceZone } = JSON.parse(draggedFieldData);
      if (sourceZone !== targetZone || fieldId === targetFieldId) return;

      if (targetZone === 'main') {
        setMainGroups(prevGroups => {
          let fieldToMove: any = null;
          let newGroups = prevGroups.map(g => {
            if (g.id === sourceGroupId) {
              const f = g.fields.find((x:any) => x.id === fieldId);
              if (f) fieldToMove = f;
              return { ...g, fields: g.fields.filter((x:any) => x.id !== fieldId) };
            }
            return g;
          });
          if (!fieldToMove) return prevGroups;
          return newGroups.map(g => {
            if (g.id === groupId) {
              if (targetFieldId) {
                const targetIndex = g.fields.findIndex((x:any) => x.id === targetFieldId);
                if(targetIndex !== -1) {
                  const newFields = [...g.fields];
                  newFields.splice(targetIndex, 0, fieldToMove);
                  return { ...g, fields: newFields };
                }
              }
              return { ...g, fields: [...g.fields, fieldToMove] };
            }
            return g;
          });
        });
      } else {
         const setTabs = targetZone === 'l2-form' ? setLevel2Tabs : setLevel3Tabs;
         const activeId = targetZone === 'l2-form' ? activeL2TabId : activeTabId;
         
         setTabs(prevTabs => prevTabs.map(t => {
            if (t.id === activeId) {
               let fieldToMove: any = null;
               let newGroups = t.groups.map((g:any) => {
                 if (g.id === sourceGroupId) {
                   const f = g.fields.find((x:any) => x.id === fieldId);
                   if (f) fieldToMove = f;
                   return { ...g, fields: g.fields.filter((x:any) => x.id !== fieldId) };
                 }
                 return g;
               });
               if (!fieldToMove) return t;

               return {
                 ...t,
                 groups: newGroups.map((g:any) => {
                   if (g.id === groupId) {
                     if (targetFieldId) {
                       const targetIndex = g.fields.findIndex((x:any) => x.id === targetFieldId);
                       if(targetIndex !== -1) {
                         const newFields = [...g.fields];
                         newFields.splice(targetIndex, 0, fieldToMove);
                         return { ...g, fields: newFields };
                       }
                     }
                     return { ...g, fields: [...g.fields, fieldToMove] };
                   }
                   return g;
                 })
               };
            }
            return t;
         }));
      }
      return;
    }

    if (!componentType) return;

    let currentEntityKey = '';
    let usedFields: string[] = [];
    
    if (targetZone === 'main') {
      currentEntityKey = boundMainEntity;
      usedFields = mainGroups.flatMap(g => g.fields).map(f => f.boundSystemField).filter(Boolean);
    } else if (targetZone.startsWith('l2-')) {
      const tab = level2Tabs.find(t => t.id === activeL2TabId);
      if (tab) {
        currentEntityKey = tab.boundEntity || '';
        usedFields = tab.groups.flatMap((g: any) => g.fields).map((f:any) => f.boundSystemField).filter(Boolean);
      }
    } else if (targetZone.startsWith('l3-')) {
      const tab = level3Tabs.find(t => t.id === activeTabId);
      if (tab) {
        currentEntityKey = tab.boundEntity || '';
        usedFields = tab.groups.flatMap((g: any) => g.fields).map((f:any) => f.boundSystemField).filter(Boolean);
      }
    }

    if (!currentEntityKey) {
      alert('لطفاً ابتدا اتصال موجودیت را انجام دهید.');
      return;
    }

    const currentEntityFieldsObj = (entityDictionary as any)[currentEntityKey]?.fields || [];
    const availableFields = currentEntityFieldsObj.filter((f: any) => !usedFields.includes(f.id));

    if (availableFields.length === 0) {
      alert('همه فیلدهای این موجودیت قبلاً استفاده شده‌اند.');
      return;
    }

    const firstAvailable = availableFields[0];

    const newItem = {
      id: `field_${Date.now()}`,
      type: componentType,
      label: firstAvailable.label,
      name: firstAvailable.name || firstAvailable.id,
      boundSystemField: firstAvailable.id,
      required: false
    };

    if ((targetZone === 'main' || targetZone === 'l2-form' || targetZone === 'l3-form') && groupId) {
      if (targetZone === 'main') {
        setMainGroups(groups => groups.map(g => {
          if (g.id === groupId) {
            if (targetFieldId) {
              const targetIndex = g.fields.findIndex((x:any) => x.id === targetFieldId);
              if (targetIndex !== -1) {
                 const newFields = [...g.fields];
                 newFields.splice(targetIndex, 0, newItem);
                 return { ...g, fields: newFields };
              }
            }
            return { ...g, fields: [...g.fields, newItem] };
          }
          return g;
        }));
      } else {
        const setTabs = targetZone === 'l2-form' ? setLevel2Tabs : setLevel3Tabs;
        const activeId = targetZone === 'l2-form' ? activeL2TabId : activeTabId;
         
        setTabs(tabs => tabs.map((t:any) => {
          if (t.id === activeId) {
             return {
                  ...t,
                  groups: t.groups.map((g:any) => {
                       if (g.id === groupId) {
                            if (targetFieldId) {
                               const targetIndex = g.fields.findIndex((x:any) => x.id === targetFieldId);
                               if (targetIndex !== -1) {
                                  const newFields = [...g.fields];
                                  newFields.splice(targetIndex, 0, newItem);
                                  return { ...g, fields: newFields };
                               }
                            }
                            return { ...g, fields: [...g.fields, newItem] };
                       }
                       return g;
                  })
             };
          }
          return t;
        }));
      }
    } else if (targetZone === 'l2-grid-columns') {
       setLevel2Tabs(tabs => tabs.map(t => t.id === activeL2TabId ? { ...t, gridColumns: [...t.gridColumns, newItem] } : t));
    } else if (targetZone === 'l3-grid-columns') {
      setLevel3Tabs(tabs => tabs.map(t => t.id === activeTabId ? { ...t, gridColumns: [...t.gridColumns, newItem] } : t));
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleAddGroup = (zone: string) => {
    const newGroup = { id: `g_${Date.now()}`, name: 'گروه جدید', columns: 2, fields: [] };
    if (zone === 'main') setMainGroups([...mainGroups, newGroup]);
  };

  const handleDeleteGroup = (e: React.MouseEvent, groupId: string, zone: string) => {
    e.stopPropagation();
    if (zone === 'main') setMainGroups(mainGroups.filter(g => g.id !== groupId));
    else if (zone === 'l2-form') setLevel2Tabs(tabs => tabs.map(t => t.id === activeL2TabId ? { ...t, groups: t.groups.filter((g:any) => g.id !== groupId) } : t));
    else if (zone === 'l3-form') setLevel3Tabs(tabs => tabs.map(t => t.id === activeTabId ? { ...t, groups: t.groups.filter((g:any) => g.id !== groupId) } : t));
    
    if (selectedElement?.id === groupId) setSelectedElement(null);
  };

  const handleDeleteElement = (e: React.MouseEvent, id: string, zone: string, groupId: string | null = null) => {
    e.stopPropagation();
    if (zone === 'main' && groupId) {
      setMainGroups(groups => groups.map(g => 
        g.id === groupId ? { ...g, fields: g.fields.filter((f:any) => f.id !== id) } : g
      ));
    } else if (zone === 'l2-form' && groupId) {
      setLevel2Tabs(tabs => tabs.map(t => t.id === activeL2TabId ? { ...t, groups: t.groups.map((g:any) => g.id === groupId ? { ...g, fields: g.fields.filter((f:any) => f.id !== id) } : g) } : t));
    } else if (zone === 'l3-form' && groupId) {
      setLevel3Tabs(tabs => tabs.map(t => t.id === activeTabId ? { ...t, groups: t.groups.map((g:any) => g.id === groupId ? { ...g, fields: g.fields.filter((f:any) => f.id !== id) } : g) } : t));
    } else if (zone === 'l2-grid-columns') {
      setLevel2Tabs(tabs => tabs.map(t => t.id === activeL2TabId ? { ...t, gridColumns: t.gridColumns.filter((c:any) => c.id !== id) } : t));
    } else if (zone === 'l3-grid-columns') {
      setLevel3Tabs(tabs => tabs.map(t => t.id === activeTabId ? { ...t, gridColumns: t.gridColumns.filter((c:any) => c.id !== id) } : t));
    }
    if (selectedElement?.id === id) setSelectedElement(null);
  };

  const updateElementProp = (prop: string, value: any) => {
    if (!selectedElement) return;
    const id = selectedElement.id;
    
    if (selectedElement.type === 'container-group') {
      setMainGroups(groups => groups.map(g => g.id === id ? { ...g, [prop]: value } : g));
      setSelectedElement((prev: any) => ({...prev, [prop]: value}));
      return;
    }
    
    if (selectedElement.type === 'container-l2-panel') {
      setLevel2Tabs(tabs => tabs.map(t => t.id === selectedElement._tabId ? { ...t, [prop]: value } : t));
      setSelectedElement((prev: any) => ({...prev, [prop]: value}));
      return;
    }
    
    if (selectedElement.type === 'container-l3-panel') {
      setLevel3Tabs(tabs => tabs.map(t => t.id === selectedElement._tabId ? { ...t, [prop]: value } : t));
      setSelectedElement((prev: any) => ({...prev, [prop]: value}));
      return;
    }

    if (selectedElement.type === 'container-l2-group') {
      setLevel2Tabs(tabs => tabs.map(t => ({
         ...t,
         groups: t.groups.map((g: any) => g.id === id ? { ...g, [prop]: value } : g)
      })));
      setSelectedElement((prev: any) => ({...prev, [prop]: value}));
      return;
    }

    if (selectedElement.type === 'container-l3-group') {
      setLevel3Tabs(tabs => tabs.map(t => ({
         ...t,
         groups: t.groups.map((g: any) => g.id === id ? { ...g, [prop]: value } : g)
      })));
      setSelectedElement((prev: any) => ({...prev, [prop]: value}));
      return;
    }

    setMainGroups(groups => groups.map(g => ({
      ...g, fields: g.fields.map(f => f.id === id ? { ...f, [prop]: value } : f)
    })));
    setLevel2Tabs(tabs => tabs.map(t => ({
      ...t,
      gridColumns: t.gridColumns.map((c: any) => c.id === id ? { ...c, [prop]: value } : c),
      groups: t.groups.map((g: any) => {
         if (g.id === id) return { ...g, [prop]: value };
         return {
            ...g,
            fields: g.fields.map((f: any) => f.id === id ? { ...f, [prop]: value } : f)
         };
      })
    })));
    setLevel3Tabs(tabs => tabs.map(t => ({
      ...t,
      gridColumns: t.gridColumns.map((c: any) => c.id === id ? { ...c, [prop]: value } : c),
      groups: t.groups.map((g: any) => {
         if (g.id === id) return { ...g, [prop]: value };
         return {
            ...g,
            fields: g.fields.map((f: any) => f.id === id ? { ...f, [prop]: value } : f)
         };
      })
    })));
    setSelectedElement((prev: any) => ({...prev, [prop]: value}));
  };

  const getGridColsClass = (columnsCount: number) => {
    return ({
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    } as any)[columnsCount] || 'grid-cols-1 md:grid-cols-2';
  };

  const pageVariants = {
    initial: { opacity: 0, x: -30, scale: 0.98 },
    in: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    out: { opacity: 0, x: 30, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-teal-100 text-gray-800 flex flex-col overflow-hidden font-vazir text-right">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap');
        .font-vazir { font-family: 'Vazirmatn', sans-serif !important; }
      `}</style>
      
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-14 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center space-x-reverse space-x-4 text-sm font-semibold">
          <span className="font-bold">فرم جدید</span>
          <span className="text-gray-300 mx-1">|</span>
          <span className="text-gray-500 flex items-center gap-1">شرکت ۱ <ChevronDown className="w-3.5 h-3.5" /></span>
          <span className="bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full text-xs mr-2">ثبت اولیه</span>
        </div>
        <div className="flex items-center space-x-reverse space-x-4">
          <button className="flex items-center space-x-reverse space-x-1 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md text-sm hover:bg-indigo-200 transition">
            <Save className="w-4 h-4" /> <span>ذخیره ⌄</span>
          </button>
          <button className="flex items-center space-x-reverse space-x-1 bg-white border border-gray-200 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition">
            <span>تغییر وضعیت ⌄</span>
          </button>
          <button className="text-gray-500 hover:text-gray-700 p-1 bg-white border border-gray-200 rounded-md">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-white/90 backdrop-blur-md border-l border-white/40 shadow-lg flex flex-col z-10">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 text-right">
            <h2 className="font-bold text-gray-700 text-sm">اجزاء و فیلدها</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <DraggableItem type="comp-text" icon={<Type className="w-4 h-4" />} label="فیلد متنی" onDragStart={handleDragStartSidebar} />
            <DraggableItem type="comp-number" icon={<Hash className="w-4 h-4" />} label="فیلد عددی" onDragStart={handleDragStartSidebar} />
            <DraggableItem type="comp-select" icon={<List className="w-4 h-4" />} label="لیست کشویی" onDragStart={handleDragStartSidebar} />
            <DraggableItem type="comp-check" icon={<CheckSquare className="w-4 h-4" />} label="چک‌باکس" onDragStart={handleDragStartSidebar} />
            <DraggableItem type="comp-relation" icon={<Database className="w-4 h-4" />} label="فیلد پیوندی (روند)" onDragStart={handleDragStartSidebar} />
            <div className="pt-4 pb-2 border-t border-gray-100 mt-4">
              <h3 className="text-[10px] font-bold text-gray-400 mb-2 px-1 uppercase tracking-wider text-right">دیتیل‌ها (ستون گرید)</h3>
              <DraggableItem type="comp-grid-col" icon={<Database className="w-4 h-4" />} label="ستون گرید" onDragStart={handleDragStartSidebar} />
            </div>
          </div>
        </aside>

        <main className="flex-1 relative overflow-hidden flex flex-col p-6">
          
            <div className="absolute inset-0 p-6 overflow-y-auto">
              <div className="max-w-5xl mx-auto space-y-4 pb-20">
                <motion.div 
                  layout
                  className={`bg-white rounded-xl transition-all border-2 ${selectedElement?.id === 'main-panel' ? 'border-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.15)] z-10 relative' : 'border-gray-100 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 hover:shadow-md cursor-pointer shadow-sm'}`}
                  onClick={() => setSelectedElement({ id: 'main-panel', type: 'container-main', label: mainPanelName })}
                >
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2"><ChevronUp className="w-4 h-4 text-gray-400" />{mainPanelName}</h3>
                      {boundMainEntity && (
                        <span className="bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5">
                          <Link2 className="w-3 h-3" /> متصل به: {(entityDictionary as any)[boundMainEntity].name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    {!boundMainEntity ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <Database className="w-6 h-6 text-indigo-500 mb-4" />
                        <h4 className="font-bold text-gray-700 mb-2">ابتدا موجودیت را متصل کنید</h4>
                        <select value="" onChange={(e) => handleBindEntity('main', e.target.value)} onClick={(e) => e.stopPropagation()} className="bg-white border border-gray-300 rounded-lg text-sm px-4 py-2 w-64 shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 cursor-pointer">
                          <option value="" disabled>-- انتخاب موجودیت --</option>
                          <option value="sales_process">روند فروش (Sales Process)</option>
                          <option value="sales_stages">مراحل فروش (Sales Stages)</option>
                        </select>
                      </div>
                    ) : (
                      <FormPanel 
                        groups={mainGroups} 
                        targetZone="main"
                        selectedElementId={selectedElement?.id}
                        onSelect={(field) => {
                          setSelectedElement({...field, _context: 'main'});
                        }}
                        onDeleteGroup={(e, id) => handleDeleteGroup(e, id, 'main')}
                        onDeleteField={(e, id, gid) => handleDeleteElement(e, id, 'main', gid)}
                        onAddGroup={() => handleAddGroup('main')}
                        onDrop={(e, gid, tfid) => handleDrop(e, 'main', gid, tfid)}
                        onDragOver={handleDragOver}
                        onDragStartField={(e, id, gid) => e.dataTransfer.setData('draggedField', JSON.stringify({ fieldId: id, sourceGroupId: gid, sourceZone: 'main' }))}
                        
                      />
                    )}
                  </div>
                </motion.div>

                <div className="relative min-h-[400px]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div key={currentView.id} initial="initial" animate="in" exit="out" variants={pageVariants} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden flex flex-col transition-all cursor-[inherit] ${isRoot && level2Tabs.length === 1 ? (selectedElement?.id === `l2-panel-${level2Tabs[0].id}` ? 'border-indigo-500 ring-4 ring-indigo-500/15' : 'border-gray-100 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 cursor-pointer') : 'border-gray-100'}`} onClick={(e) => { 
                      e.stopPropagation(); 
                      if (isRoot && level2Tabs.length === 1) {
                        setSelectedElement({ ...level2Tabs[0], id: `l2-panel-${level2Tabs[0].id}`, type: 'container-l2-panel', label: level2Tabs[0].title, _tabId: level2Tabs[0].id, _context: 'l2' });
                      } else {
                        setSelectedElement(null); 
                      }
                    }}>
                      <div className="flex flex-col bg-slate-50/30 rounded-t-xl border-b border-gray-100">
                        {/* --- ROW 1: BREADCRUMBS --- */}
                        {!(isRoot && level2Tabs.length > 1) && (
                        <div className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isRoot ? (
                              <div className="flex items-center gap-2">
                                {level2Tabs.length === 1 ? (
                                  <div className="flex items-center gap-1">
                                    <div 
                                      className={`font-bold text-sm px-2 py-1 rounded-md cursor-pointer transition-all ${selectedElement?.id === `l2-panel-${level2Tabs[0].id}` ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50/50 hover:ring-2 hover:ring-indigo-300'}`}
                                      onClick={(e) => { e.stopPropagation(); setSelectedElement({ ...level2Tabs[0], id: `l2-panel-${level2Tabs[0].id}`, type: 'container-l2-panel', label: level2Tabs[0].title, _tabId: level2Tabs[0].id, _context: 'l2' }); }}
                                      onDoubleClick={(e) => { e.stopPropagation(); setEditingTabId(level2Tabs[0].id); }}
                                    >
                                      {editingTabId === level2Tabs[0].id ? (
                                          <input 
                                            autoFocus 
                                            defaultValue={level2Tabs[0].title}
                                            onBlur={(e) => {
                                              setLevel2Tabs(tabs => tabs.map(t => t.id === level2Tabs[0].id ? { ...t, title: e.target.value } : t));
                                              setEditingTabId(null);
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                setLevel2Tabs(tabs => tabs.map(t => t.id === level2Tabs[0].id ? { ...t, title: (e.target as HTMLInputElement).value } : t));
                                                setEditingTabId(null);
                                              }
                                            }}
                                            className="bg-transparent border-b border-indigo-300 outline-none w-20 text-center"
                                          />
                                        ) : (
                                          level2Tabs[0].title
                                        )}
                                    </div>
                                    <button onClick={(e) => {
                                      e.stopPropagation();
                                      const newId = `l2_tab_${Date.now()}`;
                                      const newTab = {
                                         id: newId,
                                         title: 'تب جدید',
                                         boundEntity: '',
                                         viewType: 'grid',
                                         gridColumns: [],
                                         groups: [{ id: `base_${newId}`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                         gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                      };
                                      setLevel2Tabs([...level2Tabs, newTab]);
                                      setActiveL2TabId(newId);
                                      setSelectedElement({ ...newTab, id: `l2-panel-${newTab.id}`, type: 'container-l2-panel', label: newTab.title, _tabId: newTab.id, _context: 'l2' });
                                    }} className="text-gray-400 hover:text-indigo-600 transition-colors ml-2">
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                              ) : null}
                            </div>
                          ) : (
                              <div className="flex items-center gap-2">
                                 <button onClick={(e) => { e.stopPropagation(); handleBack(); }} className="py-1 px-1.5 hover:bg-gray-200 rounded-md text-gray-500 flex items-center gap-1.5 transition-colors">
                                   <ArrowRight className="w-4 h-4" />
                                   <span className="text-xs font-bold text-gray-600 pt-0.5">{viewStack.length === 2 ? level2Tabs.find(t => t.id === activeL2TabId)?.title || viewStack[0].title : viewStack[viewStack.length - 2].title}</span>
                                 </button>
                                 <span className="text-gray-300 mx-1">|</span>
                                 <div className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[11px] font-bold">سطح {viewStack.length}</div>
                              </div>
                            )}
                          </div>
                          
                          
                        </div>
                        )}

                        {/* --- ROW 2: TABS (ALWAYS VISIBLE) --- */}
                        {(!isRoot || (isRoot && level2Tabs.length > 1)) && (
                        <div className={`flex w-full bg-slate-50/80 px-4 ${isRoot && level2Tabs.length > 1 ? 'pt-0' : 'pt-1 border-t border-gray-100'}`}>
                           {(() => {
                              const tabs = isRoot ? level2Tabs : level3Tabs;
                              const activeId = isRoot ? activeL2TabId : activeTabId;
                              const setTabs = isRoot ? setLevel2Tabs : setLevel3Tabs;
                              const setActiveId = isRoot ? setActiveL2TabId : setActiveTabId;
                              const contextType = isRoot ? 'l2' : 'l3';

                              return (
                                 <>
                                  {tabs.map(tab => (
                                    <div key={tab.id} className="relative group/tab flex items-center">
                                      <div
                                        onClick={(e) => { e.stopPropagation(); setActiveId(tab.id); setSelectedElement({ ...tab, id: `${contextType}-panel-${tab.id}`, type: `container-${contextType}-panel`, label: tab.title, _tabId: tab.id, _context: contextType }); }}
                                        onDoubleClick={(e) => { e.stopPropagation(); setEditingTabId(tab.id); }}
                                        className={`px-6 py-2.5 text-[13px] font-bold transition-all relative select-none cursor-pointer ${activeId === tab.id ? 'text-indigo-800' : 'text-gray-500 hover:text-indigo-600'} ${selectedElement?.id === `${contextType}-panel-${tab.id}` ? 'bg-indigo-50/40 rounded-t-lg' : 'hover:bg-indigo-50/20 hover:ring-2 hover:ring-inset hover:ring-indigo-300 rounded-t-lg'}`}
                                      >
                                        {editingTabId === tab.id ? (
                                          <input 
                                            autoFocus 
                                            defaultValue={tab.title}
                                            onBlur={(e) => {
                                              setTabs(tabs.map(t => t.id === tab.id ? { ...t, title: e.target.value } : t) as any);
                                              setEditingTabId(null);
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                setTabs(tabs.map(t => t.id === tab.id ? { ...t, title: (e.target as HTMLInputElement).value } : t) as any);
                                                setEditingTabId(null);
                                              }
                                            }}
                                            className="bg-transparent border-b border-indigo-300 outline-none w-24 text-center"
                                          />
                                        ) : (
                                          tab.title
                                        )}
                                        {activeId === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600" />}
                                      </div>
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          if (tabs.length === 1) return;
                                          const newTabs = tabs.filter(t => t.id !== tab.id);
                                          setTabs(newTabs as any);
                                          if (activeId === tab.id) {
                                            setActiveId(newTabs[0].id);
                                            setSelectedElement({ ...newTabs[0], id: `${contextType}-panel-${newTabs[0].id}`, type: `container-${contextType}-panel`, label: newTabs[0].title, _tabId: newTabs[0].id, _context: contextType });
                                          } else if (selectedElement?._tabId === tab.id) {
                                            setSelectedElement(null);
                                          }
                                        }}
                                        className={`absolute left-1 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover/tab:opacity-100 ${tabs.length === 1 ? 'hidden' : ''}`}
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                  {true && (
                                    <button 
                                      onClick={(e) => {
                                         e.stopPropagation();
                                         const newId = `${contextType}_tab_${Date.now()}`;
                                         const newTab = {
                                            id: newId,
                                            title: 'تب جدید',
                                            boundEntity: '',
                                            viewType: contextType === 'l2' ? 'grid' : 'form',
                                            gridColumns: [],
                                            groups: [{ id: `base_${newId}`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                            gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                         };
                                         setTabs([...tabs, newTab] as any);
                                         setActiveId(newId);
                                         setSelectedElement({ ...newTab, id: `${contextType}-panel-${newTab.id}`, type: `container-${contextType}-panel`, label: newTab.title, _tabId: newTab.id, _context: contextType });
                                      }}
                                      className="px-2 py-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100/80 rounded-md transition-all flex items-center justify-center my-[5px] ml-4"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  )}
                                 </>
                              );
                           })()}
                        </div>
                        )}
                      </div>

                      <div className="p-4">
                        {(() => {
                          const activeTab = isRoot 
                            ? (level2Tabs.find(t => t.id === activeL2TabId) || level2Tabs[0])
                            : (level3Tabs.find(t => t.id === activeTabId) || level3Tabs[0]);
                            
                          const updateTab = isRoot ? updateActiveL2Tab : updateActiveTab;
                          const contextType = isRoot ? 'l2' : 'l3';
                          
                          return (
                            <div className="flex flex-col">

                              
                              <div className="flex flex-col min-h-[300px]">

                                 {!activeTab.boundEntity ? (
                                  <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center">
                                    <Database className="w-6 h-6 text-indigo-500 mb-4" />
                                    <h4 className="font-bold text-gray-700 mb-2">اتصال پنل به موجودیت</h4>
                                    <select 
                                      value="" 
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateTab(t => {
                                          const fields = (entityDictionary as any)[val]?.fields || [];
                                          return {
                                            ...t,
                                            boundEntity: val,
                                            gridColumns: fields,
                                            groups: [{ id: `g_base_${t.id}`, name: 'اطلاعات پایه', columns: 2, fields: fields }]
                                          };
                                        });
                                        if (selectedElement?._tabId === activeTab.id) setSelectedElement(null);
                                      }} 
                                      onClick={(e) => e.stopPropagation()} 
                                      className="bg-white border border-gray-300 rounded-lg text-sm px-4 py-2 w-64 shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 cursor-pointer"
                                    >
                                      <option value="" disabled>-- انتخاب موجودیت --</option>
                                      <option value="sales_process">روند فروش (Sales Process)</option>
                                      <option value="sales_stages">مراحل فروش (Sales Stages)</option>
                                      <option value="stage_info">اطلاعات مرحله (Stage Info)</option>
                                      <option value="key_info">اطلاعات کلیدی (Key Info)</option>
                                    </select>
                                  </div>
                                 ) : (
                                    activeTab.viewType === 'grid' ? (
                                      <GridTable 
                                        columns={activeTab.gridColumns}
                                        data={initialGridData}
                                        settings={activeTab.gridSettings}
                                        selectedElementId={selectedElement?.id}
                                        onSelect={setSelectedElement}
                                        onDeleteColumn={(e, id) => {
                                             e.stopPropagation();
                                             updateTab(t => ({ ...t, gridColumns: t.gridColumns.filter((c:any) => c.id !== id) }));
                                        }}
                                        onDrillDown={(row) => handleDrillDown(row)}
                                        onDrop={(e) => handleDrop(e, `${contextType}-grid-columns`)}
                                        onDragOver={handleDragOver}
                                      />
                                    ) : (
                                      <FormPanel 
                                        groups={activeTab.groups}
                                        targetZone={`${contextType}-form` as any}
                                        selectedElementId={selectedElement?.id}
                                        onSelect={(field) => {
                                          if (field.type.startsWith('comp-')) {
                                            setSelectedElement({...field, _context: contextType, _tabId: activeTab.id});
                                          } else {
                                            setSelectedElement({...field, _context: contextType, _tabId: activeTab.id});
                                          }
                                        }}
                                        onDeleteGroup={(e, id) => {
                                             e.stopPropagation();
                                             updateTab(t => ({ ...t, groups: t.groups.filter((g:any) => g.id !== id) }));
                                        }}
                                        onDeleteField={(e, id, gid) => {
                                             e.stopPropagation();
                                             updateTab(t => ({ 
                                                  ...t, 
                                                  groups: t.groups.map((g:any) => g.id === gid ? { ...g, fields: g.fields.filter((f:any) => f.id !== id) } : g) 
                                             }));
                                        }}
                                        onAddGroup={() => {
                                             const newId = `g_${Date.now()}`;
                                             updateTab(t => ({ ...t, groups: [...t.groups, { id: newId, name: 'گروه جدید', columns: 2, fields: [] }] }));
                                        }}
                                        onDrop={(e, gid, tfid) => handleDrop(e, `${contextType}-form`, gid, tfid)}
                                        onDragOver={handleDragOver}
                                        onDragStartField={(e, id, gid) => e.dataTransfer.setData('draggedField', JSON.stringify({ fieldId: id, sourceGroupId: gid, sourceZone: `${contextType}-form` }))}
                                        
                                      />
                                    )
                                 )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          
        </main>

        <aside className="w-72 bg-white/95 backdrop-blur-md border-r border-white/40 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] flex flex-col z-10">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50 text-right">
            <Settings className="w-4 h-4 text-gray-500" />
            <h2 className="font-bold text-gray-700 text-sm">تنظیمات</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {(() => {
              let currentEntityKey = '';
              if (selectedElement) {
                if (selectedElement._context === 'main') currentEntityKey = boundMainEntity;
                else if (selectedElement._context === 'l2') currentEntityKey = level2Tabs.find(t => t.id === selectedElement._tabId)?.boundEntity || '';
                else if (selectedElement._context === 'l3') currentEntityKey = level3Tabs.find(t => t.id === selectedElement._tabId)?.boundEntity || '';
              }
              const currentEntityName = currentEntityKey ? (entityDictionary as any)[currentEntityKey]?.name || '' : '';
              const currentEntityFieldsObj = currentEntityKey ? ((entityDictionary as any)[currentEntityKey]?.fields || []) : [];
              
              // We need to figure out which fields are already used in the same context to filter them out!
              // For simplicity now, we can just use currentEntityFieldsObj.
              // Wait, the user wants: "وقتی که یه فیلدی رو اضافه میکنه، باید حتما به یه فیلد اون موجودیت انتخاب شده وصلش کنه... فقط مقادیری رو انتخاب میکنه که متصل نکرده"
              
              let usedFields = [] as string[];
              if (selectedElement) {
                let groupsInContext: any[] = [];
                if (selectedElement._context === 'main') groupsInContext = mainGroups;
                else if (selectedElement._context === 'l2') groupsInContext = level2Tabs.find(t => t.id === selectedElement._tabId)?.groups || [];
                else if (selectedElement._context === 'l3') groupsInContext = level3Tabs.find(t => t.id === selectedElement._tabId)?.groups || [];
                
                usedFields = groupsInContext.flatMap(g => g.fields).map(f => f.boundSystemField).filter(Boolean);
              }
              const availableFields = currentEntityFieldsObj.filter((f: any) => !usedFields.includes(f.id) || f.id === selectedElement?.boundSystemField);
              const availableFieldsOptions = availableFields.map((f: any) => f.id);
              const availableFieldsLabels = availableFields.map((f: any) => `${f.label} (${f.name || f.id})`);

              return !selectedElement ? (
                <div className="text-center text-gray-400 text-sm mt-10">
                  <Settings className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  المان را انتخاب کنید.
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {selectedElement.type?.includes('group') ? (
                  <>
                    <PropertyField label="نام گروه" type="text" value={selectedElement.name} onChange={(val) => updateElementProp('name', val)} info="نامی که در بالای این گروه نمایش داده می‌شود." />
                    <PropertyField label="تعداد ستون‌ها" type="select" value={selectedElement.columns?.toString()} options={['1', '2', '3', '4']} optionsLabels={['۱ ستون', '۲ ستون', '۳ ستون', '۴ ستون']} onChange={(val) => updateElementProp('columns', Number(val))} info="تعداد ستون‌های چیدمان فیلدها در این گروه را تعیین می‌کند." />
                  </>
                ) : selectedElement.type === 'container-main' ? (
                  <>
                    <PropertyField label="عنوان پنل" type="text" value={selectedElement.label} info="عنوانی که در بالای پنل اصلی نمایش داده می‌شود." onChange={(val) => {
                      setMainPanelName(val);
                      setSelectedElement({ ...selectedElement, label: val });
                    }} />
                    <PropertyField label="اتصال موجودیت" type="select" value={boundMainEntity} options={['', 'sales_process', 'sales_stages', 'stage_info', 'key_info']} optionsLabels={['-- قطع اتصال --', 'روند فروش', 'مراحل فروش', 'اطلاعات مرحله', 'اطلاعات کلیدی']} onChange={(val) => handleBindEntity('main', val)} info="اتصال این پنل به یک جدول در دیتابیس. فیلدهای پیش‌فرض را بارگذاری می‌کند." />
                  </>
                ) : selectedElement.type === 'container-l2-panel' || selectedElement.type === 'container-l3-panel' ? (
                  <>
                    <PropertyField label="عنوان تب/پنل" type="text" value={selectedElement.label || selectedElement.title} onChange={(val) => { updateElementProp('title', val); updateElementProp('label', val); }} info="نامی که روی تب مورد نظر نمایش داده خواهد شد." />
                    <PropertyField 
                        label="اتصال موجودیت" 
                        info="اتصال این تب به یک جدول یا رفرنس در دیتابیس." 
                        type="select" 
                        value={selectedElement.boundEntity} 
                        options={['', 'sales_process', 'sales_stages', 'stage_info', 'key_info']} 
                        optionsLabels={['-- قطع اتصال --', 'روند فروش', 'مراحل فروش', 'اطلاعات مرحله', 'اطلاعات کلیدی']} 
                        onChange={(val) => {
                            const fields = (entityDictionary as any)[val]?.fields || [];
                            updateElementProp('boundEntity', val);
                            updateElementProp('gridColumns', fields);
                            updateElementProp('groups', [{ id: `l3g_base_${Date.now()}`, name: 'اطلاعات پایه', columns: 2, fields: fields }]);
                        }} 
                    />
                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-xs font-bold text-gray-600 mb-3 text-right">نوع نمایش</label>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <button onClick={() => updateElementProp('viewType', 'grid')} className={`flex flex-col items-center p-3 rounded-xl border-2 ${selectedElement.viewType === 'grid' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'}`}><Table className="w-5 h-5 mb-1" /><span className="text-[10px] font-bold">جدول</span></button>
                        <button onClick={() => updateElementProp('viewType', 'form')} className={`flex flex-col items-center p-3 rounded-xl border-2 ${selectedElement.viewType === 'form' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'}`}><LayoutTemplate className="w-5 h-5 mb-1" /><span className="text-[10px] font-bold">فرم</span></button>
                      </div>
                      {selectedElement.viewType === 'grid' && (
                        <div className="space-y-1">
                          <ToggleSwitch label="افزودن" checked={selectedElement.gridSettings?.showAdd} onChange={(val) => updateElementProp('gridSettings', {...selectedElement.gridSettings, showAdd: val})} info="نمایش دکمه ایجاد رکوردهای جدید در جدول." />
                          <ToggleSwitch label="جستجو" checked={selectedElement.gridSettings?.showSearch} onChange={(val) => updateElementProp('gridSettings', {...selectedElement.gridSettings, showSearch: val})} info="نمایش کادر جستجو برای فیلتر کردن رکوردهای جدول." />
                          <ToggleSwitch label="انتخاب" checked={selectedElement.gridSettings?.showCheckbox} onChange={(val) => updateElementProp('gridSettings', {...selectedElement.gridSettings, showCheckbox: val})} info="امکان انتخاب تکی یا دسته‌جمعی ردیف‌های جدول." />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <PropertyField 
                      label="موجودیت متصل" 
                      type="text" 
                      value={currentEntityName || 'نامشخص'} 
                      onChange={() => {}} 
                      disabled={true}
                    />
                    <PropertyField 
                      label="اتصال به فیلد موجودیت" 
                      type="select" 
                      value={selectedElement.boundSystemField || ''} 
                      options={['', ...availableFieldsOptions]} 
                      optionsLabels={['-- انتخاب فیلد --', ...availableFieldsLabels]} 
                      onChange={(val) => {
                        updateElementProp('boundSystemField', val);
                        const fieldDef = currentEntityFieldsObj.find((f: any) => f.id === val);
                        if (fieldDef) {
                           updateElementProp('label', fieldDef.label);
                           updateElementProp('name', fieldDef.name);
                           updateElementProp('type', fieldDef.type);
                        }
                      }} 
                    />

                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      <h3 className="font-bold text-gray-700 text-sm mb-2">تنظیمات {
                        selectedElement.type === 'comp-text' ? 'فیلد متنی' : 
                        selectedElement.type === 'comp-number' ? 'فیلد عددی' : 
                        selectedElement.type === 'comp-select' ? 'فیلد کشویی' : 
                        selectedElement.type === 'comp-check' ? 'فیلد چک‌باکس' : 'فیلد'
                      }</h3>
                      
                      <div className="space-y-3 pb-3 border-b border-gray-100">
                        <ToggleSwitch 
                          label="نمایش" 
                          checked={selectedElement.visible !== false} 
                          onChange={(val) => {
                            if (!val && selectedElement.required) {
                              alert('فیلدی که اجباری است نمیتواند غیر قابل نمایش باشد');
                              return;
                            }
                            updateElementProp('visible', val);
                          }} 
                          info="مقدار ورودی فیلد: فعال/غیرفعال" 
                        />
                        <ToggleSwitch 
                          label="الزامی بودن" 
                          checked={!!selectedElement.required} 
                          onChange={(val) => {
                            if (val && selectedElement.visible === false) {
                              alert('اگر فیلدی نمایش آن غیر فعال بود نمیتوان اجباری باشد');
                              return;
                            }
                            updateElementProp('required', val);
                            if (val && selectedElement.editable === false) {
                              updateElementProp('editable', true);
                            }
                          }} 
                          info="مقدار ورودی فیلد: اجباری/اختیاری" 
                        />
                        <ToggleSwitch 
                          label="قابل ویرایش" 
                          checked={selectedElement.editable !== false} 
                          onChange={(val) => {
                            if (!val && selectedElement.required) {
                              alert('امکان غیرفعال کردن ویرایش در حالت اجباری وجود ندارد');
                              return;
                            }
                            updateElementProp('editable', val);
                          }} 
                          info="اگر کاربر دسترسی به ویرایش سند را داشت میتواند این فیلد را ویرایش کند" 
                        />
                      </div>

                      {selectedElement.type === 'comp-text' && (
                        <div className="space-y-3">
                          <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg space-y-3">
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">محدودیت طول کاراکتر</label>
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <PropertyField 
                                  label="حداقل" 
                                  type="number" 
                                  value={selectedElement.minLength ?? ''} 
                                  onChange={(val) => {
                                    if (val === '') {
                                      if (selectedElement.required) {
                                        updateElementProp('minLength', 1);
                                      } else {
                                        updateElementProp('minLength', '');
                                      }
                                      return;
                                    }
                                    let num = parseInt(val);
                                    if (isNaN(num)) num = 0;
                                    if (num < 0) num = 0;
                                    if (selectedElement.required && num < 1) {
                                      num = 1;
                                    }
                                    if (num > 512) num = 512;
                                    if (selectedElement.maxLength && num > selectedElement.maxLength) {
                                      alert('کمترین طول از بیشترین طول متن، بیشتر نباشد');
                                      return;
                                    }
                                    updateElementProp('minLength', num);
                                    if (selectedElement.defaultValue && selectedElement.defaultValue.length < num) {
                                      updateElementProp('defaultValue', '');
                                    }
                                  }} 
                                />
                              </div>
                              <div className="flex-1">
                                <PropertyField 
                                  label="حداکثر (تا 512)" 
                                  type="number" 
                                  value={selectedElement.maxLength ?? ''} 
                                  onChange={(val) => {
                                    if (val === '') {
                                      updateElementProp('maxLength', '');
                                      return;
                                    }
                                    let num = parseInt(val);
                                    if (isNaN(num) || num <= 0) return;
                                    if (num > 512) num = 512;
                                    if (selectedElement.minLength && num < selectedElement.minLength) {
                                      alert('کمترین طول از بیشترین طول متن، بیشتر نباشد');
                                      return;
                                    }
                                    updateElementProp('maxLength', num);
                                    if (selectedElement.defaultValue && selectedElement.defaultValue.length > num) {
                                      updateElementProp('defaultValue', selectedElement.defaultValue.substring(0, num));
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg space-y-3">
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">مقادیر اولیه و متن راهنما</label>
                            <PropertyField 
                              label="مقدار پیش فرض" 
                              type="text" 
                              value={selectedElement.defaultValue || ''} 
                              onChange={(val) => {
                                const len = val.length;
                                if (len > 512) {
                                  alert('پیش فرض حداکثر میتواند طول کامل 512 کاراکتر باشد');
                                  return;
                                }
                                if (selectedElement.maxLength && len > selectedElement.maxLength) {
                                  alert('مقدار پیشفرض نمیتواند از بیشترین طول مشخص شده بیشتر باشد');
                                  return;
                                }
                                updateElementProp('defaultValue', val);
                              }} 
                              onBlur={() => {
                                if (selectedElement.defaultValue && selectedElement.minLength && selectedElement.defaultValue.length < selectedElement.minLength) {
                                  alert('طول مقدار پیش فرض از کمترین عدد مشخص شده کمتر است');
                                  updateElementProp('defaultValue', '');
                                }
                              }}
                            />
                            <PropertyField 
                              label="متن نگهدارنده (Placeholder)" 
                              type="text" 
                              value={selectedElement.placeholder || ''} 
                              onChange={(val) => updateElementProp('placeholder', val)} 
                            />
                          </div>

                          <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg space-y-2">
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">تنظیمات نمایش</label>
                            <ToggleSwitch 
                              label="چند خطی (Textarea)" 
                              checked={selectedElement.multiline} 
                              onChange={(val) => updateElementProp('multiline', val)} 
                            />
                          </div>
                        </div>
                      )}
                      
                      {selectedElement.type === 'comp-number' && (
                        <div className="space-y-3">
                          <PropertyField label="حداقل مقدار" type="text" value={selectedElement.min || ''} onChange={(val) => updateElementProp('min', val)} info="کمترین عدد مجاز برای این فیلد." />
                          <PropertyField label="حداکثر مقدار" type="text" value={selectedElement.max || ''} onChange={(val) => updateElementProp('max', val)} info="بیشترین عدد مجاز برای این فیلد." />
                        </div>
                      )}

                      {selectedElement.type === 'comp-select' && (
                        <div className="space-y-3">
                          <PropertyField label="منبع داده" type="select" value={selectedElement.dataSource || 'static'} options={['static', 'dynamic']} optionsLabels={['مقادیر ثابت', 'داینامیک (API)']} onChange={(val) => updateElementProp('dataSource', val)} info="تعیین می‌کند که مقادیر لیست به صورت ثابت وارد شوند یا از سرور دریافت شوند." />
                          {selectedElement.dataSource !== 'dynamic' && (
                             <PropertyField label="گزینه‌های لیست" type="text" value={selectedElement.optionsList || ''} onChange={(val) => updateElementProp('optionsList', val)} info="مقادیر را با ویرگول (,) از یکدیگر جدا کنید." />
                          )}
                        </div>
                      )}
                      
                      {selectedElement.type === 'comp-check' && (
                        <div className="space-y-3">
                          <PropertyField label="متن چک‌باکس" type="text" value={selectedElement.checkText || selectedElement.label} onChange={(val) => updateElementProp('checkText', val)} info="متنی که دقیقاً کنار تیک گزینه‌ها می‌آید." />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            );
            })()}
          </div>
        </aside>
      </div>
    </div>
  );
}
