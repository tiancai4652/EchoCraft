import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { VoiceRecorder } from './components/voice-recorder';
import { SettingsPanel } from './components/settings-panel';
import { ResultPanel } from './components/result-panel';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import './App.css';

export interface AIModel {
  id: string;
  name: string;
  apiKey?: string;
}

export interface PolishScene {
  id: string;
  name: string;
  prompt: string;
}

export interface AppSettings {
  hotkey: string;
  selectedModel: string;
  selectedScene: string;
  models: AIModel[];
  scenes: PolishScene[];
}

const defaultSettings: AppSettings = {
  hotkey: 'F9',
  selectedModel: 'openai',
  selectedScene: 'general',
  models: [
    { id: 'openai', name: 'OpenAI GPT' },
    { id: 'claude', name: 'Claude' },
    { id: 'wenxin', name: '文心一言' },
    { id: 'tongyi', name: '通义千问' }
  ],
  scenes: [
    { id: 'general', name: '通用润色', prompt: '请帮我润色以下文字，去除口语化表达，使其更加正式和流畅：' },
    { id: 'product', name: '产品需求', prompt: '请将以下口语化的产品需求整理成规范的产品需求文档格式：' },
    { id: 'code', name: '代码设计', prompt: '请将以下技术讨论整理成清晰的技术设计文档：' },
    { id: 'report', name: '工作汇报', prompt: '请将以下内容整理成正式的工作汇报格式：' },
    { id: 'plan', name: '计划制定', prompt: '请将以下想法整理成结构化的计划文档：' }
  ]
};

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [originalText, setOriginalText] = useState('');
  const [polishedText, setPolishedText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  // 监听全局快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'F9') {
        event.preventDefault();
        toggleRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleRecordingComplete = (text: string) => {
    setOriginalText(text);
    setIsRecording(false);
    polishText(text);
  };

  const polishText = async (text: string) => {
    setIsPolishing(true);
    try {
      // 这里应该调用实际的AI API
      // 现在使用模拟的润色结果
      const scene = settings.scenes.find(s => s.id === settings.selectedScene);
      const prompt = scene?.prompt || settings.scenes[0].prompt;
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟润色结果
      const polished = simulatePolish(text);
      setPolishedText(polished);
    } catch (error) {
      console.error('润色失败:', error);
      setPolishedText('润色失败，请重试');
    } finally {
      setIsPolishing(false);
    }
  };

  const simulatePolish = (text: string): string => {
    // 简单的模拟润色逻辑
    return text
      .replace(/嗯+/g, '')
      .replace(/那个+/g, '')
      .replace(/就是说/g, '')
      .replace(/然后/g, '接下来')
      .replace(/这样子/g, '这样')
      .replace(/的话/g, '')
      .trim();
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="voice-tool-theme">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* 头部工具栏 */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">语音转文字工具</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              设置
            </Button>
          </div>

          {/* 设置面板 */}
          {showSettings && (
            <div className="mb-6">
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                onClose={() => setShowSettings(false)}
              />
            </div>
          )}

          {/* 主要内容区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 录音面板 */}
            <div className="space-y-4">
              <VoiceRecorder
                isRecording={isRecording}
                onToggleRecording={toggleRecording}
                onRecordingComplete={handleRecordingComplete}
                hotkey={settings.hotkey}
              />
            </div>

            {/* 结果面板 */}
            <div className="space-y-4">
              <ResultPanel
                originalText={originalText}
                polishedText={polishedText}
                isPolishing={isPolishing}
                selectedScene={settings.scenes.find(s => s.id === settings.selectedScene)?.name || '通用润色'}
              />
            </div>
          </div>

          {/* 快捷键提示 */}
          <div className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center text-sm text-gray-600">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">{settings.hotkey}</kbd>
              <span>开始/结束录音</span>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;