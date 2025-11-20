
'use client';

import { useState } from 'react';
import { Upload, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DatasetUpload({ open, onClose, onDatasetAdded, conversationId }) {
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [dbType, setDbType] = useState('sql');
  const [connStr, setConnStr] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsFileUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId || '');

    try {
      const res = await fetch('/api/upload-dataset', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        onDatasetAdded(data.dataset);
        onClose();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleConnect = async () => {
    if (!connStr.trim()) {
      alert('Enter connection string');
      return;
    }
    setIsConnecting(true);

    try {
      const res = await fetch('/api/connect-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString: connStr, type: dbType, conversationId }),
      });
      const data = await res.json();

      if (data.success) {
        onDatasetAdded(data.dataset);
        onClose();
        setConnStr('');
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Connection failed:', err);
      alert('Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Data Source</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="file">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" disabled={isConnecting}>
              <Upload className="w-4 h-4 mr-2" /> Upload
            </TabsTrigger>
            <TabsTrigger value="db" disabled={isFileUploading}>
              <Database className="w-4 h-4 mr-2" /> Database
            </TabsTrigger>
          </TabsList>
          <TabsContent value="file">
            {isFileUploading ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <h1>Uploading..</h1>
              </div>
            ) : (
              <>
                <Label>Excel or CSV or PDF or DOCX</Label>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf,.docx"
                  onChange={handleFileUpload}
                  disabled={isConnecting}
                  className="mt-2"
                />
              </>
            )}
          </TabsContent>
          <TabsContent value="db" className="space-y-4">
            <div>
              <Label>Type</Label>
              <select
                value={dbType}
                onChange={(e) => setDbType(e.target.value)}
                className="w-full border rounded p-2 mt-2 dark:text-black text-black"
                disabled={isFileUploading || isConnecting}
              >
                <option value="sql">SQL</option>
                <option value="mongodb">MongoDB</option>
              </select>
            </div>
            <div>
              <Label>Connection String</Label>
              <Input
                value={connStr}
                onChange={(e) => setConnStr(e.target.value)}
                placeholder="Enter connection string"
                className="mt-2"
                disabled={isFileUploading || isConnecting}
              />
            </div>
            <Button
              onClick={handleConnect}
              disabled={isFileUploading || isConnecting}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}