import fs from 'fs';

let content = fs.readFileSync('./src/App.tsx', 'utf-8');

const dragStart = content.indexOf('  const handleDrop =');
const getGridColsStart = content.indexOf('  const getGridColsClass =');

if (dragStart !== -1 && getGridColsStart !== -1) {
  const block = `  const handleDrop = (e: React.DragEvent, targetZone: string, groupId: string | null = null, targetFieldId: string | null = null) => {
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

    const newItem = {
      id: \`field_\${Date.now()}\`,
      type: componentType,
      label: 'فیلد جدید',
      name: 'فیلد جدید',
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
    const newGroup = { id: \`g_\${Date.now()}\`, name: 'گروه جدید', columns: 2, fields: [] };
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
`;
  content = content.slice(0, dragStart) + block + '\n' + content.slice(getGridColsStart);
}

fs.writeFileSync('./src/App.tsx', content, 'utf-8');
console.log('App.tsx patched successfully');
