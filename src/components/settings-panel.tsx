import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Trash2 } from 'lucide-react';
import { AppSettings, AIModel, PolishScene } from '../App';

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onSettingsChange, onClose }: SettingsPanelProps) {
  const updateSettings = (updates: Partial<AppSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const updateModel = (modelId: string, updates: Partial<AIModel>) => {
    const updatedModels = settings.models.map(model =>
      model.id === modelId ? { ...model, ...updates } : model
    );
    updateSettings({ models: updatedModels });
  };

  const updateScene = (sceneId: string, updates: Partial<PolishScene>) => {
    const updatedScenes = settings.scenes.map(scene =>
      scene.id === sceneId ? { ...scene, ...updates } : scene
    );
    updateSettings({ scenes: updatedScenes });
  };

  const addCustomScene = () => {
    const newScene: PolishScene = {
      id: `custom_${Date.now()}`,
      name: '自定义场景',
      prompt: '请润色以下文字：'
    };
    updateSettings({ scenes: [...settings.scenes, newScene] });
  };

  const deleteScene = (sceneId: string) => {
    if (settings.scenes.length <= 1) return; // 至少保留一个场景
    const updatedScenes = settings.scenes.filter(scene => scene.id !== sceneId);
    updateSettings({ 
      scenes: updatedScenes,
      selectedScene: settings.selectedScene === sceneId ? updatedScenes[0].id : settings.selectedScene
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>设置</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 快捷键设置 */}
        <div className="space-y-2">
          <Label htmlFor="hotkey">快捷键</Label>
          <Input
            id="hotkey"
            value={settings.hotkey}
            onChange={(e) => updateSettings({ hotkey: e.target.value })}
            placeholder="F9"
          />
          <p className="text-xs text-gray-500">
            支持功能键如 F9, F10 等
          </p>
        </div>

        {/* AI模型选择 */}
        <div className="space-y-2">
          <Label>AI模型</Label>
          <Select value={settings.selectedModel} onValueChange={(value) => updateSettings({ selectedModel: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {settings.models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* API密钥设置 */}
        <div className="space-y-3">
          <Label>API密钥配置</Label>
          {settings.models.map((model) => (
            <div key={model.id} className="space-y-2">
              <Label className="text-sm text-gray-600">{model.name}</Label>
              <Input
                type="password"
                placeholder={`输入${model.name}的API密钥`}
                value={model.apiKey || ''}
                onChange={(e) => updateModel(model.id, { apiKey: e.target.value })}
              />
              {/* 文心一言采用千帆 Bearer 单 Key 模式，无需 Secret */}
            </div>
          ))}
        </div>

        {/* 润色场景设置 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>润色场景</Label>
            <Button variant="outline" size="sm" onClick={addCustomScene}>
              <Plus className="w-4 h-4 mr-1" />
              添加场景
            </Button>
          </div>
          
          <Select value={settings.selectedScene} onValueChange={(value) => updateSettings({ selectedScene: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {settings.scenes.map((scene) => (
                <SelectItem key={scene.id} value={scene.id}>
                  {scene.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 场景编辑 */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {settings.scenes.map((scene) => (
              <div key={scene.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Input
                    value={scene.name}
                    onChange={(e) => updateScene(scene.id, { name: e.target.value })}
                    className="font-medium"
                  />
                  {settings.scenes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteScene(scene.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  value={scene.prompt}
                  onChange={(e) => updateScene(scene.id, { prompt: e.target.value })}
                  placeholder="输入润色提示词..."
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}