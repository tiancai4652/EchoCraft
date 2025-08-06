import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';

interface VoiceRecorderProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  onRecordingComplete: (transcript: string) => void;
  hotkey: string;
}

export function VoiceRecorder({ 
  isRecording, 
  onToggleRecording, 
  onRecordingComplete,
  hotkey 
}: VoiceRecorderProps) {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecognitionActive(false);
      };

      recognition.onend = () => {
        setIsRecognitionActive(false);
      };
    }
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isRecording && !isRecognitionActive) {
      try {
        setTranscript('');
        setIsRecognitionActive(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsRecognitionActive(false);
      }
    } else if (!isRecording && isRecognitionActive) {
      try {
        recognitionRef.current.stop();
        setIsRecognitionActive(false);
        if (transcript.trim()) {
          onRecordingComplete(transcript.trim());
        }
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }, [isRecording, isRecognitionActive, transcript, onRecordingComplete]);

  if (!isSupported) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MicOff className="h-5 w-5" />
            语音录制
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            您的浏览器不支持语音识别功能。请使用Chrome、Edge或Safari浏览器。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full transition-all duration-300 ${isRecording ? 'ring-2 ring-red-500 ring-opacity-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isRecording ? (
            <Mic className="h-5 w-5 text-red-500 animate-pulse" />
          ) : (
            <MicOff className="h-5 w-5" />
          )}
          语音录制
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={onToggleRecording}
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            className="flex-1"
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                停止录制 ({hotkey})
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                开始录制 ({hotkey})
              </>
            )}
          </Button>
        </div>

        {transcript && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">实时识别结果：</h4>
            <p className="text-sm leading-relaxed">{transcript}</p>
          </div>
        )}

        {isRecording && (
          <div className="flex items-center justify-center p-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="ml-3 text-sm text-muted-foreground">正在录制中...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}