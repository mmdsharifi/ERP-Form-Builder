import React from 'react';
import { useFormState } from './hooks/useFormState';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SettingsPanel } from './components/layout/SettingsPanel';
import { MainPanel } from './components/canvas/MainPanel';
import { DetailPanel } from './components/canvas/DetailPanel';

export default function App() {
  const formState = useFormState();
  
  return (
    <div dir={formState.language === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-teal-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 text-gray-800 dark:text-slate-100 flex flex-col overflow-hidden font-vazir text-start transition-colors duration-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap');
        .font-vazir { font-family: 'Vazirmatn', sans-serif !important; }
      `}</style>
      
      <Header 
        language={formState.language}
        setLanguage={formState.setLanguage}
        t={formState.t}
        onReset={() => {
          formState.setMainGroups([{ id: 'g_base', name: formState.t('baseInfo'), columns: 5, fields: [] }]);
          formState.setBoundMainEntity('');
          formState.setMainPanelColumns(5);
          formState.setMainPanelName(formState.language === 'fa' ? 'اطلاعات اصلی' : 'Main Panel');
          formState.setLevel2Tabs([
            {
              id: 'l2_tab_1',
              title: formState.language === 'fa' ? 'اقلام' : 'Items',
              boundEntity: '',
              viewType: 'grid',
              gridColumns: [],
              groups: [{ id: 'l2g_base_1', name: formState.t('baseInfo'), columns: 2, fields: [] }],
              gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
            }
          ]);
          formState.setActiveL2TabId('l2_tab_1');
          formState.setViewStack([{ id: 'root', type: 'main', title: formState.language === 'fa' ? 'اطلاعات اصلی' : 'Main Panel' }]);
          formState.setSelectedElement(null);
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          onDragStart={formState.handleDragStartSidebar} 
          t={formState.t} 
        />
        
        <main className="flex-1 relative overflow-hidden flex flex-col p-6">
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-4 pb-20">
              <MainPanel 
                selectedElement={formState.selectedElement}
                setSelectedElement={formState.setSelectedElement}
                mainPanelName={formState.mainPanelName}
                boundMainEntity={formState.boundMainEntity}
                mainGroups={formState.mainGroups}
                handleDrop={formState.handleDrop}
                handleDragOver={formState.handleDragOver}
                handleAddGroup={formState.handleAddGroup}
                handleDeleteGroup={formState.handleDeleteGroup}
                handleDeleteElement={formState.handleDeleteElement}
                t={formState.t}
                translateTitle={formState.translateTitle}
                entities={formState.entities}
                handleBindEntity={formState.handleBindEntity}
                draggedType={formState.draggedType}
                setDraggedType={formState.setDraggedType}
                mainPanelColumns={formState.mainPanelColumns}
                onUpdateFieldProp={formState.updateElementProp}
                language={formState.language}
              />
              
              <DetailPanel 
                currentView={formState.currentView}
                viewStack={formState.viewStack}
                isRoot={formState.isRoot}
                level2Tabs={formState.level2Tabs}
                activeL2TabId={formState.activeL2TabId}
                selectedElement={formState.selectedElement}
                setSelectedElement={formState.setSelectedElement}
                setLevel2Tabs={formState.setLevel2Tabs}
                setActiveL2TabId={formState.setActiveL2TabId}
                updateActiveL2Tab={formState.updateActiveL2Tab}
                handleDrop={formState.handleDrop}
                handleDragOver={formState.handleDragOver}
                language={formState.language}
                t={formState.t}
                translateTitle={formState.translateTitle}
                entities={formState.entities}
                draggedType={formState.draggedType}
                setDraggedType={formState.setDraggedType}
              />
            </div>
          </div>
        </main>
        
        <SettingsPanel 
          selectedElement={formState.selectedElement}
          updateElementProp={formState.updateElementProp}
          boundMainEntity={formState.boundMainEntity}
          level2Tabs={formState.level2Tabs}
          mainGroups={formState.mainGroups}
          setMainPanelName={formState.setMainPanelName}
          setSelectedElement={formState.setSelectedElement}
          handleBindEntity={formState.handleBindEntity}
          language={formState.language}
          t={formState.t}
          translateTitle={formState.translateTitle}
          entities={formState.entities}
          addEntity={formState.addEntity}
          mainPanelColumns={formState.mainPanelColumns}
          autoBindCreatedEntity={formState.autoBindCreatedEntity}
        />
      </div>
    </div>
  );
}
