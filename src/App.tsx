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
  // apiSecret?: string; // no longer needed for Wenxin (Qianfan Bearer)
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

const SETTINGS_STORAGE_KEY = 'echocraft_app_settings_v1';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return defaultSettings;
      const parsed = JSON.parse(raw) as AppSettings;
      const merged: AppSettings = {
        ...defaultSettings,
        ...parsed,
        models: defaultSettings.models.map((def) => {
          const existing = parsed.models?.find((m) => m.id === def.id);
          return { ...def, ...(existing || {}) };
        }),
      };
      return merged;
    } catch (err) {
      console.warn('加载本地设置失败，将使用默认设置。', err);
      return defaultSettings;
    }
  });
  const [originalText, setOriginalText] = useState('');
  const [polishedText, setPolishedText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  // 申请持久化存储，避免浏览器在空间紧张时清理本地数据
  useEffect(() => {
    // @ts-ignore
    if (navigator?.storage?.persist) {
      // @ts-ignore
      navigator.storage.persist().catch(() => {});
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.warn('保存本地设置失败。', err);
    }
  }, [settings]);

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
      const scene = settings.scenes.find((s) => s.id === settings.selectedScene);
      const prompt = scene?.prompt || settings.scenes[0].prompt;

      const selectedModel = settings.selectedModel;
      const modelConfig = settings.models.find((m) => m.id === selectedModel);

      if (!modelConfig?.apiKey) {
        setPolishedText('未配置所选模型的 API 密钥，请在设置中填写。');
        return;
      }

      let resultText = '';
      if (selectedModel === 'openai') {
        resultText = await callOpenAI(modelConfig.apiKey, prompt, text);
      } else if (selectedModel === 'claude') {
        resultText = await callClaude(modelConfig.apiKey, prompt, text);
      } else if (selectedModel === 'tongyi') {
        resultText = await callTongyi(modelConfig.apiKey, prompt, text);
      } else if (selectedModel === 'wenxin') {
        resultText = await callWenxin(modelConfig.apiKey, prompt, text);
      } else {
        console.warn(`模型 ${selectedModel} 暂未实现真实 API 调用，已回退到本地模拟。`);
        resultText = simulatePolish(text);
      }

      setPolishedText(resultText);
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

  const callOpenAI = async (
    apiKey: string,
    prompt: string,
    text: string
  ): Promise<string> => {
    const endpoint = (import.meta as any).env?.DEV
      ? '/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    const messages = [
      { role: 'system', content: '你是一名中文文本润色助手。请在保留原意的前提下，使表达更加正式、通顺、结构化，并仅输出润色后的文本。' },
      { role: 'user', content: `${prompt}\n\n${text}` },
    ];
    const body = {
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
    } as const;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`OpenAI 调用失败: ${res.status} ${res.statusText} ${errText}`);
    }
    const data: any = await res.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenAI 返回内容为空');
    return content.trim();
  };

  const callClaude = async (
    apiKey: string,
    prompt: string,
    text: string
  ): Promise<string> => {
    const endpoint = (import.meta as any).env?.DEV
      ? '/anthropic/v1/messages'
      : 'https://api.anthropic.com/v1/messages';
    const body = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: '你是一名中文文本润色助手。请在保留原意的前提下，使表达更加正式、通顺、结构化，并仅输出润色后的文本。',
      messages: [
        { role: 'user', content: `${prompt}\n\n${text}` },
      ],
    } as const;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Claude 调用失败: ${res.status} ${res.statusText} ${errText}`);
    }
    const data: any = await res.json();
    const content: string | undefined = data?.content?.[0]?.text;
    if (!content) throw new Error('Claude 返回内容为空');
    return content.trim();
  };

  const callTongyi = async (
    apiKey: string,
    prompt: string,
    text: string
  ): Promise<string> => {
    const endpoint = (import.meta as any).env?.DEV
      ? '/dashscope/compatible-mode/v1/chat/completions'
      : 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    const messages = [
      { role: 'system', content: '你是一名中文文本润色助手。请在保留原意的前提下，使表达更加正式、通顺、结构化，并仅输出润色后的文本。' },
      { role: 'user', content: `${prompt}\n\n${text}` },
    ];
    const body = {
      model: 'qwen-turbo',
      messages,
      temperature: 0.3,
    } as const;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`通义千问调用失败: ${res.status} ${res.statusText} ${errText}`);
    }
    const data: any = await res.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('通义千问返回内容为空');
    return content.trim();
  };

  const callWenxin = async (
    apiKey: string,
    prompt: string,
    text: string
  ): Promise<string> => {
    const endpoint = (import.meta as any).env?.DEV
      ? '/qianfan/v2/chat/completions'
      : 'https://qianfan.baidubce.com/v2/chat/completions';

    const body = {
      model: 'ernie-3.5-8k',
      messages: [
        { role: 'user', content: `${prompt}\n\n${text}` },
      ],
      temperature: 0.3,
    } as const;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`文心一言调用失败: ${res.status} ${res.statusText} ${errText}`);
    }
    const data: any = await res.json();
    const content: string | undefined = data?.result || data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('文心一言返回内容为空');
    return content.trim();
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