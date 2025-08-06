# EchoCraft 

A web-based voice-to-text tool that supports real-time speech recognition and AI-powered text enhancement.

## ✨ Key Features

### 🎤 Voice Recording & Recognition
- **Global Hotkey Support**: Default F9 to start/stop recording (customizable)
- **Real-time Speech Recognition**: Text appears as you speak
- **Browser Compatibility**: Works with Chrome, Edge, Safari and other modern browsers
- **Visual Feedback**: Red border and animation effects during recording

### 🤖 AI Text Enhancement
- **Multiple Scenarios**:
  - General Enhancement: Removes conversational elements for more formal, fluid expression
  - Product Requirements: Formats text as standardized product requirement documents
  - Code Design: Structures text as clear technical design documentation
  - Work Reports: Formats text as formal work reports
  - Planning: Organizes text into structured planning documents
- **Custom Scenarios**: Add and edit your own enhancement scenarios

### 🔧 Settings Management
- **Customizable Hotkeys**: Modify recording shortcuts
- **Multiple AI Models**: OpenAI GPT, Claude, Wenxin Yiyan, Tongyi Qianwen
- **API Key Configuration**: Securely store API keys for various AI services
- **Scenario Management**: Add, edit, and delete enhancement scenarios

### 📋 Results Display
- **Side-by-Side Comparison**: Original text and enhanced text displayed together
- **One-Click Copy**: Quickly copy original or enhanced text
- **File Download**: Save enhanced results as txt files
- **Character Count**: Shows character count comparison before and after enhancement

## 🚀 Quick Start

### Requirements
- Node.js 16+ 
- Modern browser (Chrome, Edge, Safari, etc.)
- Microphone permissions

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Build Production Version
```bash
npm run build
```

## 📖 How to Use

1. **Start Recording**: Press F9 or click the microphone button
2. **Speak**: Start talking, text will appear in real-time
3. **End Recording**: Press F9 again or click the stop button
4. **AI Enhancement**: System automatically sends the transcribed text to AI for enhancement
5. **View Results**: Check the enhanced text in the right panel
6. **Copy and Use**: Copy the enhanced text to clipboard with one click

## ⚙️ Configuration

### API Key Setup
Configure API keys for various AI services in the settings panel:
- OpenAI GPT: Requires OpenAI API key
- Claude: Requires Anthropic API key
- Wenxin Yiyan: Requires Baidu API key
- Tongyi Qianwen: Requires Alibaba Cloud API key

### Custom Scenarios
Add custom enhancement scenarios in settings:
1. Click "Add Scenario" button
2. Enter scenario name
3. Write enhancement prompt
4. Save settings

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 + TypeScript
- **UI Component Library**: shadcn/ui
- **Styling Framework**: Tailwind CSS
- **Build Tool**: Vite
- **Speech Recognition**: Web Speech API
- **State Management**: React Hooks

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── voice-recorder.tsx  # Voice recording component
│   ├── settings-panel.tsx  # Settings panel component
│   ├── result-panel.tsx    # Results display component
│   └── theme-provider.tsx  # Theme provider
├── hooks/                  # Custom Hooks
├── lib/                    # Utility functions
├── App.tsx                 # Main application component
└── main.tsx               # Application entry point
```

## 🌟 Feature Details

### Responsive Design
- Supports desktop and mobile devices
- Adaptive layout for good experience across different screen sizes

### Accessibility Support
- Keyboard navigation support
- Screen reader friendly
- High contrast support

### Data Security
- API keys stored locally
- No sensitive information uploaded
- Supports offline speech recognition

## 🔧 Development Notes

### Adding New AI Models
1. Add new model to `defaultSettings.models` array in `App.tsx`
2. Add corresponding API call in enhancement logic
3. Update model selection in settings panel

### Customizing UI Theme
- Modify theme configuration in `tailwind.config.ts`
- Update CSS variables in `globals.css`
- Use shadcn/ui theme system

## 📝 Changelog

### v1.0.0 (2024-12-19)
- ✨ Initial release
- 🎤 Voice recording and real-time recognition
- 🤖 AI enhancement functionality
- ⚙️ Settings management
- 📋 Results display and export features

## 📄 License

MIT License

## 🤝 Contributions

Issues and Pull Requests are welcome to improve this project!

## 📞 Support

If you encounter issues while using this tool:
1. Check the README documentation
2. Check browser console for error messages
3. Confirm microphone permissions are granted
4. Submit an issue describing the problem