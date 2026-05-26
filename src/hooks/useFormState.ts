import React, { useState } from 'react';

// --- MOCK DATA ---
export const entityDictionary = {
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

export const initialGridData = [
  { id: 1, name: 'داده نمونه ۱', probability: '10' }
];

export function useFormState() {
  // --- STATE MANAGEMENT ---
  const [entities, setEntities] = useState<Record<string, { name: string; fields: any[]; status?: string }>>(entityDictionary);

  const addEntity = (systemName: string, name: string, fields: any[], status?: string) => {
    setEntities(prev => ({
      ...prev,
      [systemName]: { name, fields, status }
    }));
  };

  const [mainGroups, setMainGroups] = useState([
    { id: 'g_base', name: 'اطلاعات پایه', columns: 5, fields: [] as any[] }
  ]);

  const [boundMainEntity, setBoundMainEntity] = useState('');
  const [mainPanelName, setMainPanelName] = useState('اطلاعات اصلی');
  const [mainPanelColumns, setMainPanelColumns] = useState(5);

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



  const currentView = viewStack[viewStack.length - 1];
  const isRoot = viewStack.length === 1;

  const [language, setLanguage] = useState<'fa' | 'en'>('fa');
  
  const translations = {
    fa: {
      sum: 'جمع',
      avg: 'میانگین',
      minAgg: 'کمینه',
      maxAgg: 'بیشینه',
      count: 'تعداد',
      search: 'جستجو...',
      add: 'جدید',
      deleteColumn: 'حذف ستون',
      deleteRow: 'حذف سطر',
      dragColumnsHere: 'ستون‌ها را اینجا رها کنید',
      viewDetails: 'مشاهده جزئیات',
      details: 'جزئیات',
      doubleClickToRename: 'برای تغییر نام دو بار کلیک کنید',
      selectedColumns: 'ستون‌های هدف',
      rowTitle: 'عنوان سطر',
      operator: 'نوع تجمیع',
      addFooterRow: '+ جدید',
      deleteGroup: 'حذف گروه',
      deleteField: 'حذف فیلد',
      lock: 'قفل',
      hidden: 'پنهان',
      select: 'انتخاب',
      addNewGroup: 'افزودن گروه جدید',
      dropFieldsHere: 'فیلدها را اینجا رها کنید',
      newForm: 'فرم جدید',
      company1: 'شرکت ۱',
      draftStatus: 'ثبت اولیه',
      save: 'ذخیره',
      changeStatus: 'تغییر وضعیت',
      moreActions: 'عملیات بیشتر',
      language: 'زبان',
      theme: 'پوسته',
      lightMode: 'روشن',
      darkMode: 'تیره',
      resetCanvas: 'بازنشانی بوم',
      confirmReset: 'آیا مطمئن هستید که می‌خواهید کل بوم را بازنشانی کنید؟ تمام تغییرات شما پاک خواهد شد.',
      fieldsAndComponents: 'اجزاء و فیلدها',
      textField: 'فیلد متنی',
      numberField: 'فیلد عددی',
      selectField: 'لیست کشویی',
      checkboxField: 'چک‌باکس',
      relationField: 'فیلد پیوندی (روند)',
      gridColumnField: 'ستون گرید',
      formulaColumnField: 'ستون محاسباتی',
      detailsGridColumn: 'دیتیل‌ها (ستون گرید)',
      level: 'سطح',
      connectPanelToEntity: 'اتصال پنل به موجودیت',
      selectEntity: '-- انتخاب موجودیت --',
      newTab: 'تب جدید',
      newGroup: 'گروه جدید',
      baseInfo: 'اطلاعات پایه',
      settings: 'تنظیمات',
      selectElement: 'المان را انتخاب کنید.',
      groupName: 'نام گروه',
      groupNameInfo: 'نامی که در بالای این گروه نمایش داده می‌شود.',
      columnsCount: 'تعداد ستون‌ها',
      columnsCountInfo: 'تعداد ستون‌های چیدمان فیلدها در این گروه را تعیین می‌کند.',
      oneColumn: '۱ ستون',
      twoColumns: '۲ ستون',
      threeColumns: '۳ ستون',
      fourColumns: '۴ ستون',
      fiveColumns: '۵ ستون',
      sixColumns: '۶ ستون',
      panelTitle: 'عنوان پنل',
      panelTitleInfo: 'عنوانی که در بالای پنل اصلی نمایش داده می‌شود.',
      bindEntity: 'اتصال موجودیت',
      bindEntityInfo: 'اتصال این پنل به یک جدول در دیتابیس. فیلدهای پیش‌فرض را بارگذاری می‌کند.',
      disconnect: '-- قطع اتصال --',
      entity: 'موجودیت',
      sales_process: 'روند فروش',
      sales_stages: 'مراحل فروش',
      stage_info: 'اطلاعات مرحله',
      key_info: 'اطلاعات کلیدی',
      addEntity: 'افزودن موجودیت جدید',
      entitiesTitle: 'موجودیت‌ها',
      entityDisplayName: 'نام نمایشی موجودیت',
      entitySystemName: 'نام سیستمی موجودیت (انگلیسی)',
      dateField: 'فیلد تاریخ',
      f_main_1: 'عنوان روند',
      c_1: 'نام مراحل',
      c_2: 'احتمال موفقیت',
      c_3: 'توضیحات',
      s_1: 'توضیحات تکمیلی',
      k_1: 'نام فیلد',
      k_2: 'اجباری',
      mainPanel: 'اطلاعات اصلی',
      items: 'اقلام',
      connectingFields: 'در حال اتصال به موجودیت و همگام‌سازی فیلدها...',
      connectingGridColumns: 'در حال اتصال به موجودیت و همگام‌سازی ستون‌های گرید...',
      editEntity: 'ویرایش موجودیت',
      newEntity: 'موجودیت جدید',
      connectedEntity: 'موجودیت متصل',
      panelSettings: 'تنظیمات ظاهری پنل',
      dataBinding: 'اتصال داده',
      bindToEntityField: 'اتصال به فیلد موجودیت',
      selectFieldDropdown: '-- انتخاب فیلد --',
      accessAndValidation: 'اعتبارسنجی و دسترسی',
      visible: 'نمایش',
      editable: 'قابل ویرایش',
      alertRequiredMustBeVisible: 'فیلدی که اجباری است نمیتواند غیر قابل نمایش باشد',
      alertHiddenCannotBeRequired: 'اگر فیلدی نمایش آن غیر فعال بود نمیتوان اجباری باشد',
      alertRequiredMustBeEditable: 'امکان غیرفعال کردن ویرایش در حالت اجباری وجود ندارد',
      layoutAndAppearance: 'ظاهر و چیدمان',
      helperTextLabel: 'متن راهنما (Helper Text)',
      fieldWidthSpan: 'عرض فیلد (تعداد ستون)',
      specializedSettings: 'تنظیمات اختصاصی',
      minVal: 'حداقل مقدار',
      maxVal: 'حداکثر مقدار',
      dataSource: 'منبع داده',
      staticSource: 'مقادیر ثابت',
      dynamicSource: 'داینامیک (API)',
      listOptions: 'گزینه‌های لیست',
      checkboxText: 'متن چک‌باکس',
      targetEntity: 'موجودیت مرتبط (Target Entity)',
      columnTitle: 'عنوان ستون',
      charLimit: 'محدودیت طول کاراکتر',
      maxVal512: 'حداکثر (تا 512)',
      defaultValuesGroup: 'مقادیر اولیه',
      defaultValueLabel: 'مقدار پیش فرض',
      displaySettings: 'تنظیمات نمایش',
      multilineLabel: 'چند خطی (Textarea)',
      alertMinLengthCannotBeGreaterThanMax: 'کمترین طول از بیشترین طول متن، بیشتر نباشد',
      alertDefaultLengthMax512: 'پیش فرض حداکثر میتواند طول کامل 512 کاراکتر باشد',
      alertDefaultLengthCannotBeGreaterThanMax: 'مقدار پیشفرض نمیتواند از بیشترین طول مشخص شده بیشتر باشد',
      alertDefaultLengthCannotBeLessThanMin: 'طول مقدار پیش فرض از کمترین عدد مشخص شده کمتر است',
      tabPanelTitle: 'عنوان تب/پنل',
      tabPanelTitleInfo: 'نامی که روی تب مورد نظر نمایش داده خواهد شد.',
      viewType: 'نوع نمایش',
      viewTypeGrid: 'جدول (Grid)',
      viewTypeForm: 'فرم (Form)',
      gridAllowAdd: 'افزودن',
      gridAllowSearch: 'جستجو',
      gridAllowSelect: 'انتخاب',
      allowAddInfo: 'نمایش دکمه ایجاد رکوردهای جدید در جدول.',
      allowSearchInfo: 'نمایش کادر جستجو برای فیلتر کردن رکوردهای جدول.',
      allowSelectInfo: 'امکان انتخاب تکی یا دسته‌جمعی ردیف‌های جدول.',
      noSummaryRows: 'سطر تجمیعی تعریف نشده است',
      summaryRowSettings: 'تنظیمات سطر تجمیعی',
      backToTab: '← بازگشت به تب',
      entityFields: 'فیلدهای موجودیت',
      addNewField: 'افزودن فیلد جدید',
      editField: 'ویرایش فیلد',
      fieldLabel: 'نام نمایشی فیلد',
      fieldId: 'نام سیستمی فیلد',
      fieldType: 'نوع فیلد',
      dragToReorder: 'جابجایی سطر',
      removeColumn: 'حذف ستون',
      addColumn: 'افزودن',
      addSummaryRow: 'افزودن سطر تجمیعی',
      cancel: 'انصراف',
      newSummaryRow: 'سطر تجمیعی جدید',
      editSummaryRow: 'ویرایش سطر تجمیعی',
      calculation: 'نوع محاسبات',
      unspecified: 'نامشخص',
      duplicateId: 'شناسه تکراری است',
      formulaCalculation: 'محاسبه فرمول',
      noOtherColumns: 'ستون‌های عددی یا محاسباتی دیگری در این جدول وجود ندارد.',
      column: 'ستون',
      number: 'عدد',
      constantNumber: 'عدد ثابت',
      delete: 'حذف',
      addTerm: 'افزودن جمله',
      required: 'الزامی بودن',
      min: 'حداقل',
      max: 'حداکثر',
      selectEntityDropdown: '-- انتخاب موجودیت --',
      new: 'جدید',
      targetColumns: 'ستون‌های هدف',
      noTargetColumns: 'بدون ستون هدف',
      draft: 'ثبت موقت',
      published: 'منتشر شده',
      disabled: 'غیرفعال',
      alertSystemNameExists: 'این نام سیستمی قبلاً استفاده شده است',
      alertDefineAtLeastOneField: 'لطفاً حداقل یک فیلد تعریف کنید',
      unnamedField: 'فیلد بدون نام',
      noFieldsDefined: 'هنوز فیلدی تعریف نشده است. با زدن دکمه + فیلد جدید اضافه کنید.',
      noColumnsSelected: 'هیچ ستونی انتخاب نشده',
      searchColumn: 'جستجوی ستون...',
      noColumnsFound: 'ستونی یافت نشد',
    },
    en: {
      sum: 'Sum',
      avg: 'Average',
      minAgg: 'Min',
      maxAgg: 'Max',
      count: 'Count',
      search: 'Search...',
      add: 'New',
      deleteColumn: 'Delete Column',
      deleteRow: 'Delete Row',
      dragColumnsHere: 'Drag columns here',
      addEntity: 'Add New Entity',
      entitiesTitle: 'Entities',
      entityDisplayName: 'Entity Display Name',
      entitySystemName: 'Entity System Name (English)',
      dateField: 'Date Field',
      viewDetails: 'View Details',
      details: 'Details',
      doubleClickToRename: 'Double click to rename',
      selectedColumns: 'Target Columns',
      rowTitle: 'Row Title',
      operator: 'Aggregation Type',
      addFooterRow: '+ New',
      deleteGroup: 'Delete Group',
      deleteField: 'Delete Field',
      lock: 'Locked',
      hidden: 'Hidden',
      select: 'Select',
      addNewGroup: 'Add New Group',
      dropFieldsHere: 'Drop fields here',
      newForm: 'New Form',
      company1: 'Company 1',
      draftStatus: 'Draft',
      save: 'Save',
      changeStatus: 'Change Status',
      moreActions: 'More Actions',
      language: 'Language',
      theme: 'Theme',
      lightMode: 'Light',
      darkMode: 'Dark',
      resetCanvas: 'Reset Workspace',
      confirmReset: 'Are you sure you want to reset the workspace? All your changes will be cleared.',
      fieldsAndComponents: 'Fields & Components',
      textField: 'Text Field',
      numberField: 'Number Field',
      selectField: 'Dropdown List',
      checkboxField: 'Checkbox',
      relationField: 'Relation Field',
      gridColumnField: 'Grid Column',
      formulaColumnField: 'Formula Column',
      detailsGridColumn: 'Details (Grid Column)',
      level: 'Level',
      connectPanelToEntity: 'Connect Panel to Entity',
      selectEntity: '-- Select Entity --',
      newTab: 'New Tab',
      newGroup: 'New Group',
      baseInfo: 'Base Info',
      settings: 'Settings',
      selectElement: 'Select an element.',
      groupName: 'Group Name',
      groupNameInfo: 'The title displayed at the top of this group.',
      columnsCount: 'Columns Count',
      columnsCountInfo: 'Determines the number of columns for fields layout in this group.',
      oneColumn: '1 Column',
      twoColumns: '2 Columns',
      threeColumns: '3 Columns',
      fourColumns: '4 Columns',
      fiveColumns: '5 Columns',
      sixColumns: '6 Columns',
      panelTitle: 'Panel Title',
      panelTitleInfo: 'The title displayed at the top of the main panel.',
      bindEntity: 'Bind Entity',
      bindEntityInfo: 'Connects this panel to a database table and loads its default fields.',
      disconnect: '-- Disconnect --',
      entity: 'Entity',
      sales_process: 'Sales Process',
      sales_stages: 'Sales Stages',
      stage_info: 'Stage Info',
      key_info: 'Key Info',
      f_main_1: 'Process Title',
      c_1: 'Stage Name',
      c_2: 'Probability',
      c_3: 'Description',
      s_1: 'Additional Info',
      k_1: 'Field Name',
      k_2: 'Required',
      mainPanel: 'Main Panel',
      items: 'Items',
      connectingFields: 'Connecting to entity and syncing fields...',
      connectingGridColumns: 'Connecting to entity and syncing grid columns...',
      editEntity: 'Edit Entity',
      newEntity: 'New Entity',
      connectedEntity: 'Connected Entity',
      panelSettings: 'Panel Settings',
      dataBinding: 'Data Binding',
      bindToEntityField: 'Bind to Entity Field',
      selectFieldDropdown: '-- Select Field --',
      accessAndValidation: 'Access & Validation',
      visible: 'Visible',
      editable: 'Editable',
      alertRequiredMustBeVisible: 'A required field must be visible.',
      alertHiddenCannotBeRequired: 'A hidden field cannot be required.',
      alertRequiredMustBeEditable: 'A required field must be editable.',
      layoutAndAppearance: 'Layout & Appearance',
      helperTextLabel: 'Helper Text',
      fieldWidthSpan: 'Field Width (Span)',
      specializedSettings: 'Specialized Settings',
      minVal: 'Min Value',
      maxVal: 'Max Value',
      dataSource: 'Data Source',
      staticSource: 'Static',
      dynamicSource: 'Dynamic (API)',
      listOptions: 'List Options',
      checkboxText: 'Checkbox Text',
      targetEntity: 'Target Entity',
      columnTitle: 'Column Title',
      charLimit: 'Character Length Limits',
      maxVal512: 'Max (up to 512)',
      defaultValuesGroup: 'Default Values',
      defaultValueLabel: 'Default Value',
      displaySettings: 'Display Settings',
      multilineLabel: 'Multiline (Textarea)',
      alertMinLengthCannotBeGreaterThanMax: 'Minimum length cannot be greater than maximum length.',
      alertDefaultLengthMax512: 'Default value can be at most 512 characters.',
      alertDefaultLengthCannotBeGreaterThanMax: 'Default value cannot be longer than maximum length.',
      alertDefaultLengthCannotBeLessThanMin: 'Default value length cannot be less than minimum length.',
      tabPanelTitle: 'Tab/Panel Title',
      tabPanelTitleInfo: 'The title displayed on the tab.',
      viewType: 'View Type',
      viewTypeGrid: 'Grid (Table)',
      viewTypeForm: 'Form',
      gridAllowAdd: 'Allow Add',
      gridAllowSearch: 'Allow Search',
      gridAllowSelect: 'Allow Select',
      allowAddInfo: 'Show button to create new records in the table.',
      allowSearchInfo: 'Show search box to filter table records.',
      allowSelectInfo: 'Enable single or bulk row selection.',
      noSummaryRows: 'No summary rows defined',
      summaryRowSettings: 'Summary Row Settings',
      backToTab: '← Back to Tab',
      entityFields: 'Entity Fields',
      addNewField: 'Add New Field',
      editField: 'Edit Field',
      fieldLabel: 'Field Label',
      fieldId: 'Field ID',
      fieldType: 'Field Type',
      dragToReorder: 'Drag to reorder',
      removeColumn: 'Remove Column',
      addColumn: 'Add',
      addSummaryRow: 'Add Summary Row',
      cancel: 'Cancel',
      newSummaryRow: 'New Summary Row',
      editSummaryRow: 'Edit Summary Row',
      calculation: 'Calculation',
      unspecified: 'Unspecified',
      duplicateId: 'Duplicate ID',
      formulaCalculation: 'Formula Calculation',
      noOtherColumns: 'No other numeric or formula columns in this table.',
      column: 'Column',
      number: 'Number',
      constantNumber: 'Constant Number',
      delete: 'Delete',
      addTerm: 'Add Term',
      required: 'Required',
      min: 'Min',
      max: 'Max',
      selectEntityDropdown: '-- Select Entity --',
      new: 'New',
      targetColumns: 'Target Columns',
      noTargetColumns: 'No target columns',
      draft: 'Draft',
      published: 'Published',
      disabled: 'Disabled',
      alertSystemNameExists: 'System name already exists',
      alertDefineAtLeastOneField: 'Please define at least one field',
      unnamedField: 'Unnamed Field',
      noFieldsDefined: 'No fields defined yet. Press + to add a field.',
      noColumnsSelected: 'No columns selected',
      searchColumn: 'Search column...',
      noColumnsFound: 'No columns found',
    }
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  const translateTitle = (title: string): string => {
    if (title === 'اطلاعات اصلی' || title === 'Main Panel') return t('mainPanel');
    if (title === 'اقلام' || title === 'Items') return t('items');
    if (title === 'اطلاعات پایه' || title === 'Base Info') return t('baseInfo');
    if (title === 'تب جدید' || title === 'New Tab') return t('newTab');
    if (title === 'گروه جدید' || title === 'New Group') return t('newGroup');
    return title;
  };

  // --- HANDLERS ---
  const handleDrillDown = (row: any) => {};
  const handleBack = () => {};

  const handleBindEntity = (zone: string, entityKey: string) => {
    if (zone === 'main') {
      setBoundMainEntity(entityKey);
      if (entityKey && (entities as any)[entityKey]) {
        setMainGroups([
          { id: 'g_base', name: 'اطلاعات پایه', columns: 5, fields: (entities as any)[entityKey].fields }
        ]);
      } else {
        setMainGroups([
          { id: 'g_base', name: 'اطلاعات پایه', columns: 5, fields: [] }
        ]);
      }
    }
  };

  const autoBindCreatedEntity = (backElement: any, entityKey: string, fields: any[]) => {
    if (!backElement) return;

    if (backElement.type === 'container-main') {
      setBoundMainEntity(entityKey);
      setMainGroups([
        { id: 'g_base', name: 'اطلاعات پایه', columns: 5, fields }
      ]);
    } else if (backElement.type === 'container-l2-panel') {
      const tabId = backElement.id || backElement._tabId;
      setLevel2Tabs(tabs => tabs.map(t => {
        if (t.id === tabId) {
          return {
            ...t,
            boundEntity: entityKey,
            gridColumns: fields,
            groups: [{ 
              id: `l3g_base_${Date.now()}`, 
              name: 'اطلاعات پایه', 
              columns: 2, 
              fields 
            }]
          };
        }
        return t;
      }));
    }
  };

  const [draggedType, setDraggedType] = React.useState<'field' | 'column' | null>(null);

  React.useEffect(() => {
    const handleDragEnd = () => {
      setDraggedType(null);
    };
    window.addEventListener('dragend', handleDragEnd);
    return () => {
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStartSidebar = (e: React.DragEvent, itemType: string) => {
    e.dataTransfer.setData('componentType', itemType);
    if (itemType === 'comp-grid-col' || itemType === 'comp-formula') {
      setDraggedType('column');
    } else {
      setDraggedType('field');
    }
  };

  const handleDrop = (e: React.DragEvent, targetZone: string, groupId: string | null = null, targetFieldId: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();

    const componentType = e.dataTransfer.getData('componentType');
    const draggedFieldData = e.dataTransfer.getData('draggedField');

    if (draggedFieldData && (targetZone === 'main' || targetZone === 'l2-form') && groupId) {
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
                if (targetIndex !== -1) {
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
         const setTabs = setLevel2Tabs;
         const activeId = activeL2TabId;
         
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
                       if (targetIndex !== -1) {
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

    if (componentType === 'comp-formula') {
      const newItem = {
        id: `field_${Date.now()}`,
        type: 'comp-formula',
        label: language === 'fa' ? 'ستون محاسباتی' : 'Formula Column',
        name: language === 'fa' ? 'ستون محاسباتی' : 'Formula Column',
        required: false,
        formula: { segments: [], ops: [] }
      };

      if (targetZone === 'l2-grid-columns') {
        setLevel2Tabs(tabs => tabs.map(t => t.id === activeL2TabId ? { ...t, gridColumns: [...t.gridColumns, newItem] } : t));
      }
      return;
    }

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

    if ((targetZone === 'main' || targetZone === 'l2-form') && groupId) {
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
        const setTabs = setLevel2Tabs;
        const activeId = activeL2TabId;
         
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
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleAddGroup = (zone: string) => {
    const newGroup = { id: `g_${Date.now()}`, name: 'گروه جدید', columns: zone === 'main' ? 5 : 2, fields: [] };
    if (zone === 'main') setMainGroups([...mainGroups, newGroup]);
    else if (zone === 'l2-form') setLevel2Tabs(tabs => tabs.map(t => t.id === activeL2TabId ? { ...t, groups: [...t.groups, newGroup] } : t));
  };

  const handleDeleteGroup = (e: React.MouseEvent, groupId: string, zone: string) => {
    e.stopPropagation();
    if (groupId === 'g_base' || groupId.startsWith('l2g_base')) {
      return;
    }
    if (zone === 'main') setMainGroups(mainGroups.filter(g => g.id !== groupId));
    else if (zone === 'l2-form') setLevel2Tabs(tabs => tabs.map(t => t.id === activeL2TabId ? { ...t, groups: t.groups.filter((g:any) => g.id !== groupId) } : t));
    
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
    } else if (zone === 'l2-grid-columns') {
      setLevel2Tabs(tabs => tabs.map(t => t.id === activeL2TabId ? { ...t, gridColumns: t.gridColumns.filter((c:any) => c.id !== id) } : t));
    }
    if (selectedElement?.id === id) setSelectedElement(null);
  };

  const updateElementProp = (prop: string, value: any) => {
    if (!selectedElement) return;
    const id = selectedElement.id;
    
    if (selectedElement.type === 'container-main') {
      if (prop === 'label' || prop === 'title') {
        setMainPanelName(value);
        setViewStack(stack => stack.map((item, idx) => idx === 0 ? { ...item, title: value } : item));
      }
      if (prop === 'columns') {
        setMainPanelColumns(value);
        setMainGroups(groups => groups.map(g => ({ ...g, columns: value })));
      }
      setSelectedElement((prev: any) => ({...prev, [prop]: value}));
      return;
    }

    if (selectedElement.type === 'grid-footer-row') {
      const tabId = selectedElement._tabId;
      const setTabs = setLevel2Tabs;
      setTabs(tabs => tabs.map(t => {
        if (t.id === tabId) {
          const nextFooterRows = (t.footerRows || []).map((row: any) => 
            row.id === id ? { ...row, [prop]: value } : row
          );
          return { ...t, footerRows: nextFooterRows };
        }
        return t;
      }));
      setSelectedElement((prev: any) => ({...prev, [prop]: value}));
      return;
    }

    if (selectedElement.type === 'container-group') {
      setMainGroups(groups => groups.map(g => g.id === id ? { ...g, [prop]: value } : g));
      setSelectedElement((prev: any) => ({...prev, [prop]: value}));
      return;
    }
    
    if (selectedElement.type === 'container-l2-panel') {
      const nextValue = prop === 'viewType' ? 'grid' : value;
      setLevel2Tabs(tabs => tabs.map(t => t.id === selectedElement._tabId ? { ...t, [prop]: nextValue } : t));
      setSelectedElement((prev: any) => ({...prev, [prop]: nextValue}));
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
    setSelectedElement((prev: any) => ({...prev, [prop]: value}));
  };

  return {
    mainGroups,
    setMainGroups,
    boundMainEntity,
    setBoundMainEntity,
    mainPanelName,
    setMainPanelName,
    viewStack,
    setViewStack,
    selectedElement,
    setSelectedElement,
    level2Tabs,
    setLevel2Tabs,
    activeL2TabId,
    setActiveL2TabId,
    updateActiveL2Tab,
    currentView,
    isRoot,
    language,
    setLanguage,
    t,
    translateTitle,
    handleDrillDown,
    handleBack,
    handleBindEntity,
    handleDragStartSidebar,
    handleDrop,
    handleDragOver,
    handleAddGroup,
    handleDeleteGroup,
    handleDeleteElement,
    updateElementProp,
    entities,
    setEntities,
    addEntity,
    draggedType,
    setDraggedType,
    mainPanelColumns,
    setMainPanelColumns,
    autoBindCreatedEntity
  };
}

export const getGridColsClass = (columnsCount: number) => {
  return ({
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  } as any)[columnsCount] || 'grid-cols-1 md:grid-cols-2';
};

export const pageVariants = {
  initial: { opacity: 0, x: -30, scale: 0.98 },
  in: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  out: { opacity: 0, x: 30, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } }
};
