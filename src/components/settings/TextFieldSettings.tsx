import React from 'react';
import { PropertyField } from '../shared/PropertyField';
import { ToggleSwitch } from '../shared/ToggleSwitch';

interface TextFieldSettingsProps {
  selectedElement: any;
  updateElementProp: (prop: string, value: any) => void;
  t: (key: string) => string;
  language: 'fa' | 'en';
}

export const TextFieldSettings: React.FC<TextFieldSettingsProps> = ({
  selectedElement,
  updateElementProp,
  t,
  language
}) => {
  return (
    <div className="space-y-3.5">
      {/* 1. Character Limit Group */}
      <div className="pt-3 border-t border-gray-100 dark:border-slate-800/60 space-y-2">
        <label className="block text-xs font-bold text-gray-800 dark:text-slate-200 mb-1">
          {t('charLimit')}
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <PropertyField 
              label={t('min')} 
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
                  alert(t('alertMinLengthCannotBeGreaterThanMax'));
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
              label={t('maxVal512')} 
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
                  alert(t('alertMinLengthCannotBeGreaterThanMax'));
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

      {/* 2. Default Value Group */}
      <div className="pt-3 border-t border-gray-100 dark:border-slate-800/60 space-y-2">
        <label className="block text-xs font-bold text-gray-800 dark:text-slate-200 mb-1">{t('defaultValuesGroup')}</label>
        <PropertyField 
          label={t('defaultValueLabel')} 
          type="text" 
          value={selectedElement.defaultValue || ''} 
          onChange={(val) => {
            const len = val.length;
            if (len > 512) {
              alert(t('alertDefaultLengthMax512'));
              return;
            }
            if (selectedElement.maxLength && len > selectedElement.maxLength) {
              alert(t('alertDefaultLengthCannotBeGreaterThanMax'));
              return;
            }
            updateElementProp('defaultValue', val);
          }} 
          onBlur={() => {
            if (selectedElement.defaultValue && selectedElement.minLength && selectedElement.defaultValue.length < selectedElement.minLength) {
              alert(t('alertDefaultLengthCannotBeLessThanMin'));
              updateElementProp('defaultValue', '');
            }
          }}
        />
      </div>

      {/* 3. Display Type Group */}
      <div className="pt-3 border-t border-gray-100 dark:border-slate-800/60 space-y-1">
        <label className="block text-xs font-bold text-gray-800 dark:text-slate-200 mb-1">{t('displaySettings')}</label>
        <ToggleSwitch 
          label={t('multilineLabel')} 
          checked={!!selectedElement.multiline} 
          onChange={(val) => updateElementProp('multiline', val)} 
        />
      </div>
    </div>
  );
};
