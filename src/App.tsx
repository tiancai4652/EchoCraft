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
    {
      id: 'general',
      name: '通用润色',
      prompt:
        '请在充分保留原意的前提下，进行句法优化与措辞规范，去除口语与赘词，补全省略主语/谓语，合并重复信息，统一术语并提升逻辑连贯性。只输出润色后的规范书面语，不要添加额外解释或标注：'
    },
    {
      id: 'product',
      name: '产品需求（PRD）',
      prompt:
        '请将以下口语化需求整理为 Markdown PRD，结构包含：\n- 背景与目标\n- 用户画像与用户故事\n- 需求范围（内/外）\n- 功能列表与交互要点\n- 非功能性需求（性能/安全/可用性等）\n- 验收标准（使用 Given-When-Then）\n- 里程碑与排期\n- 依赖、风险与假设\n仅输出 PRD 内容。'
    },
    {
      id: 'code',
      name: '技术设计',
      prompt:
        '请将以下技术讨论整理为清晰的技术设计文档（Markdown），包含：\n- 背景与问题定义（含非目标）\n- 架构方案（可用“架构图：占位”）\n- 模块/组件职责划分\n- 数据模型与存储设计\n- 关键流程与时序（步骤化描述）\n- 接口定义（入参/出参/错误码）\n- 方案权衡与取舍\n- 边界条件与异常处理\n- 风险、回退方案与测试计划\n仅输出文档内容。'
    },
    {
      id: 'report',
      name: '工作汇报',
      prompt:
        '请将以下内容整理为正式的周报/日报（Markdown），包含：\n- 本周完成（量化指标/影响）\n- 进行中（阻塞点/解决计划）\n- 下周计划（优先级与时间）\n- 风险/阻塞（需要协助）\n语言简洁准确，条目化呈现。'
    },
    {
      id: 'plan',
      name: '计划制定',
      prompt:
        '请将以下想法整理为可执行计划（Markdown），包含：\n- 目标与度量指标（SMART）\n- 任务拆解（优先级/依赖）\n- 时间排期（可用“甘特图：占位”）\n- 负责人与里程碑\n- 验收标准与交付物\n输出结构化清单与必要表格。'
    },
    {
      id: 'meeting',
      name: '会议纪要',
      prompt:
        '请整理为会议纪要（Markdown），包含：\n- 会议主题、时间、参会人\n- 讨论要点与结论决议\n- 行动项（负责人、截止时间、状态）\n- 待跟进问题与风险\n要求客观、可追踪。'
    },
    {
      id: 'email',
      name: '邮件撰写',
      prompt:
        '请将以下内容润色为专业邮件（中文），输出包含：\n- 主题建议（1-2 个）\n- 正式称呼与开场\n- 简洁正文（要点分段）\n- 明确的行动请求（如果适用）\n- 礼貌结尾与署名\n语气专业、清晰、礼貌。'
    },
    {
      id: 'summary',
      name: '要点摘要',
      prompt:
        '请对以下内容提炼要点摘要：输出 3-7 条关键点，涵盖问题/结论/建议；必要时给出下一步行动。仅输出要点列表。'
    },
    {
      id: 'bug',
      name: '缺陷报告',
      prompt:
        '请整理为缺陷报告（Markdown），包含：\n- 环境信息与版本\n- 前置条件\n- 复现步骤（编号）\n- 预期结果 vs 实际结果\n- 截图/日志：占位\n- 严重程度与优先级\n- 可能原因与修复建议\n仅输出报告内容。'
    },
    {
      id: 'marketing',
      name: '营销文案（AIDA）',
      prompt:
        '请将以下素材整理为营销文案，采用 AIDA 结构（注意-兴趣-欲望-行动），并提供 3 个标题备选与一个明确 CTA。语言有感染力、信息真实可核。'
    }
    ,
    {
      id: 'zh2en',
      name: '中译英（专业、地道）',
      prompt:
        '请将以下中文内容准确翻译为自然、地道的英文：\n- 保留原意与关键信息，不擅自添加或省略\n- 句法与措辞符合英文习惯，避免直译腔\n- 根据上下文选择专业术语（如有歧义，选更通用表达）\n- 保持语气客观、简洁、专业\n仅输出英文译文，不要包含任何解释或原文。'
    },
    {
      id: 'en2zh',
      name: '英译中（准确、流畅）',
      prompt:
        '请将以下英文内容准确翻译为中文：\n- 忠实表达原意，确保术语一致、名称准确\n- 采用地道、流畅的书面表达，避免生硬直译\n- 遇到专有名词保留英文并在中文后括注（首次出现时）\n- 适度调整语序提升可读性\n仅输出中文译文，不要包含任何解释或原文。'
    }
    ,
    {
      id: 'commit_en',
      name: '英文提交信息（Conventional Commits）',
      prompt:
        'Please write an English Git commit message following the Conventional Commits specification.\n\nRequirements:\n- Allowed types: feat, fix, refactor, perf, docs, style, test, chore, build, ci, revert\n- Subject: imperative mood, <= 50 chars, lowercase, no trailing period\n- Optional scope in parentheses after type (e.g., feat(ui): ...)\n- Body: explain what/why/how, wrap at ~72 chars per line, highlight impact and rationale\n- Footer: BREAKING CHANGE: ..., Closes #123, Co-authored-by: ... (when applicable)\n- Include a short "Test plan:" section listing verification steps\n\nOutput strictly the commit message only, no extra explanations.'
    }
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
      // 合并默认场景与用户已有场景：
      const mergedScenes: PolishScene[] = [
        // 先用默认场景，若用户有同 id 则覆盖字段
        ...defaultSettings.scenes.map((def) => ({
          ...def,
          ...(parsed.scenes?.find((s) => s.id === def.id) || {}),
        })),
        // 再追加用户新增的自定义场景（不在默认列表中）
        ...((parsed.scenes || []).filter(
          (s) => !defaultSettings.scenes.some((def) => def.id === s.id)
        )),
      ];

      const merged: AppSettings = {
        ...defaultSettings,
        ...parsed,
        models: defaultSettings.models.map((def) => {
          const existing = parsed.models?.find((m) => m.id === def.id);
          return { ...def, ...(existing || {}) };
        }),
        scenes: mergedScenes,
        selectedScene:
          (parsed.selectedScene && mergedScenes.some((s) => s.id === parsed.selectedScene)
            ? parsed.selectedScene
            : defaultSettings.selectedScene),
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