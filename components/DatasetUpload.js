
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

  // --- New State for "Builder Mode" ---
  // We want to give users choice: Build it manually (Easy) or Paste string (Hard)
  const [useBuilder, setUseBuilder] = useState(true);
  const [dbFields, setDbFields] = useState({
    host: '',
    port: '5432',
    database: '',
    user: '',
    password: ''
  });

  // Helper to update one field at a time
  const updateDbField = (field, value) => {
    setDbFields(prev => ({ ...prev, [field]: value }));
  };

  // The Magic Logic: Transforming individual fields into a standard Connection String
  const generateConnectionString = () => {
    const { host, port, database, user, password } = dbFields;
    // Don't show confusing incomplete strings, wait for basics
    if (!host) return "Enter host details...";

    if (dbType === 'sql') {
      // PostgreSQL standard format
      return `postgresql://${user || 'user'}:${password || 'pass'}@${host}:${port || 5432}/${database || 'db'}`;
    } else {
      // MongoDB standard format
      return `mongodb+srv://${user || 'user'}:${password || 'pass'}@${host}/${database || 'db'}`;
    }
  };

  // Determine which string to use when "Connect" is clicked
  const getFinalConnectionString = () => {
    if (useBuilder) {
      return generateConnectionString();
    }
    return connStr;
  };

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
        onDatasetAdded(data.dataset, 'file');
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
    const finalConnectionString = getFinalConnectionString();

    if (!finalConnectionString.trim() || finalConnectionString.includes('...')) {
      alert('Please complete the connection details');
      return;
    }
    setIsConnecting(true);

    try {
      const res = await fetch('/api/connect-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString: finalConnectionString, type: dbType, conversationId }),
      });
      const data = await res.json();

      if (data.success) {
        onDatasetAdded(data.dataset, 'database');
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
      <DialogContent className="w-[90vw] sm:w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Data Source</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="file" className=' flex flex-col gap-4'>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
            <TabsTrigger value="file" disabled={isConnecting}>
              <Upload className="w-4 h-4 mr-2" /> Upload
            </TabsTrigger>
            <TabsTrigger value="db" disabled={isFileUploading}>
              <Database className="w-4 h-4 mr-2" /> Database
            </TabsTrigger>
          </TabsList>
          <TabsContent value="file">
            {isFileUploading ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-4 text-muted-foreground">
                <h1 className="text-primary font-medium">Uploading...</h1>
              </div>
            ) : (
              <>
                <Label className='text-xs hidden lg:block'>Excel or CSV or PDF or DOCX</Label>
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
            {/* Educational Toggle: Simple vs Advanced */}
            <div className="flex items-center space-x-2 mb-4 bg-secondary/20 p-1 rounded-lg w-fit">
              <button
                onClick={() => setUseBuilder(true)}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${useBuilder ? 'bg-background shadow-sm font-medium' : 'opacity-60 hover:opacity-100'}`}
              >
                Builder (Easy)
              </button>
              <button
                onClick={() => setUseBuilder(false)}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${!useBuilder ? 'bg-background shadow-sm font-medium' : 'opacity-60 hover:opacity-100'}`}
              >
                String (Advanced)
              </button>
            </div>

            <div>
              <Label>Database Type</Label>
              <select
                value={dbType}
                onChange={(e) => setDbType(e.target.value)}
                className="w-full border border-input rounded p-2 mt-2 bg-background text-foreground"
                disabled={isFileUploading || isConnecting}
              >
                <option value="sql">PostgreSQL (SQL)</option>
                <option value="mongodb">MongoDB (NoSQL)</option>
              </select>
            </div>

            {useBuilder ? (
              /* THE BUILDER FORM: Helps users understand what makes up a connection string */
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="col-span-2">
                  <Label className="text-xs opacity-70">Host (e.g., db.supabase.co)</Label>
                  <Input
                    placeholder="db.example.com"
                    value={dbFields.host}
                    onChange={(e) => updateDbField('host', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs opacity-70">Port</Label>
                  <Input
                    placeholder={dbType === 'sql' ? "5432" : "27017"}
                    value={dbFields.port}
                    onChange={(e) => updateDbField('port', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs opacity-70">Database Name</Label>
                  <Input
                    placeholder="my_database"
                    value={dbFields.database}
                    onChange={(e) => updateDbField('database', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs opacity-70">Username</Label>
                  <Input
                    placeholder="postgres"
                    value={dbFields.user}
                    onChange={(e) => updateDbField('user', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs opacity-70">Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={dbFields.password}
                    onChange={(e) => updateDbField('password', e.target.value)}
                  />
                </div>

                {/* Visual Feedback: Show the string being built */}
                <div className="col-span-2 mt-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                  <Label className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">Preview Connection String</Label>
                  <code className="block mt-1 text-xs break-all font-mono text-primary">
                    {generateConnectionString()}
                  </code>
                </div>
              </div>
            ) : (
              /* THE RAW INPUT: For power users who have the string ready */
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Label>Connection String</Label>
                <Input
                  value={connStr}
                  onChange={(e) => setConnStr(e.target.value)}
                  placeholder={dbType === 'sql' ? "postgresql://user:pass@host:5432/db" : "mongodb+srv://user:pass@host/db"}
                  className="mt-2 font-mono text-sm"
                  disabled={isFileUploading || isConnecting}
                />
                <p className="text-[10px] opacity-60 mt-1.5">
                  {dbType === 'sql'
                    ? "Format: postgresql://[user]:[password]@[host]:[port]/[database]"
                    : "Format: mongodb+srv://[user]:[password]@[host]/[database]"}
                </p>
              </div>
            )}

            <Button
              onClick={handleConnect}
              disabled={isFileUploading || isConnecting}
              className="w-full mt-4"
            >
              {isConnecting ? 'Connecting...' : 'Connect Database'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}