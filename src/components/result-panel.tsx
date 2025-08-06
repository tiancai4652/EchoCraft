import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResultPanelProps {
  originalText: string;
  polishedText: string;
  isPolishing: boolean;
  selectedScene: string;
}

export function ResultPanel({ 
  originalText, 
  polishedText, 
  isPolishing, 
  selectedScene 
}: ResultPanelProps) {
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "复制成功",
        description: `${type}已复制到剪贴板`,
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动选择文本复制",
        variant: "destructive",
      });
    }
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "下载成功",
      description: `文件已保存为 ${filename}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* 原始文本 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>原始录音文本</span>
            {originalText && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(originalText, '原始文本')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={originalText}
            readOnly
            placeholder="录音完成后，原始文本将显示在这里..."
            className="min-h-[100px] resize-none"
          />
        </CardContent>
      </Card>

      {/* 润色后文本 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>润色结果 ({selectedScene})</span>
            {polishedText && !isPolishing && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(polishedText, '润色文本')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadText(polishedText, `润色文本_${new Date().toLocaleString()}.txt`)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPolishing ? (
            <div className="flex items-center justify-center min-h-[100px] space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-gray-600">AI正在润色中...</span>
            </div>
          ) : (
            <Textarea
              value={polishedText}
              readOnly
              placeholder="录音结束后，AI润色结果将显示在这里..."
              className="min-h-[100px] resize-none"
            />
          )}
        </CardContent>
      </Card>

      {/* 对比统计 */}
      {originalText && polishedText && !isPolishing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">文本对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-700">
                  {originalText.length}
                </div>
                <div className="text-gray-500">原始字符数</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-700">
                  {polishedText.length}
                </div>
                <div className="text-blue-600">润色后字符数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}