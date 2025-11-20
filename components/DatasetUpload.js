
'use client';

import { useState } from 'react';
import { Upload, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DatasetUpload({ open, onClose, onDatasetAdded, conversationId }) {
  // console.log('DatasetUpload rendered with conversationId:', conversationId, onDatasetAdded);

  const [uploading, setUploading] = useState(false);
  const [dbType, setDbType] = useState('sql');
  const [connStr, setConnStr] = useState('');

  const handleFileUpload = async (e) => {
    // console.log('File upload initiated', e.target.files?.[0]);
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId || '');

    // console.log('FormData content:');
    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    try {
      const res = await fetch('/api/upload-dataset', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) { onDatasetAdded(data.dataset); onClose(); }
    } catch (err) { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleConnect = async () => {
    if (!connStr.trim()) { alert('Enter connection string'); return; }
    console.log(`Connecting to ${dbType} with connection string: ${connStr}`)
    setUploading(true);

    try {//posting the connection string to the api/connect-database route to save in databse 
      // base along with its current conversation id and Database type
      const res = await fetch('/api/connect-database', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connectionString: connStr, type: dbType, conversationId }) });
      const data = await res.json();

      console.log('Connection String successfully inserted in db:', data);

      if (data.success) {
        onDatasetAdded(data.dataset);
        onClose(); //closes the modal after the connection string is successfully added
        setConnStr('');//resets the connection string input field
      }
      else {
        alert(data.error);

      }
    }
    catch (err) {
      console.error('Connection failed:', err); alert('Connection failed');
    }
    finally {
      setUploading(false);
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
            <TabsTrigger value="file"><Upload className="w-4 h-4 mr-2" /> Upload</TabsTrigger>
            <TabsTrigger value="db"><Database className="w-4 h-4 mr-2" /> Database</TabsTrigger>
          </TabsList>
          <TabsContent value="file">
            <Label>Excel or CSV or PDF or DOCX</Label>
            <Input type="file" accept=".xlsx,.xls,.csv,.pdf,.docx" onChange={handleFileUpload} disabled={uploading} className="mt-2" />
          </TabsContent>
          <TabsContent value="db" className="space-y-4">
            <div>
              <Label>Type</Label>
              <select value={dbType} onChange={(e) => setDbType(e.target.value)} className="w-full border rounded p-2 mt-2 dark:text-black text-black">
                <option value="sql">SQL</option>
                <option value="mongodb">MongoDB</option>
              </select>
            </div>
            <div>
              <Label>Connection String</Label>
              <Input value={connStr} onChange={(e) => setConnStr(e.target.value)} placeholder="Enter connection string" className="mt-2" />
            </div>
            <Button onClick={handleConnect} disabled={uploading} className="w-full">{uploading ? 'Connecting...' : 'Connect'}</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}




// 'use client';

// import { useState } from 'react';
// import { Upload, Database } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// export function DatasetUpload({ open, onClose, onDatasetAdded, conversationId }) {

//   const [uploading, setUploading] = useState(false);
//   const [dbType, setDbType] = useState('sql');
//   const [connStr, setConnStr] = useState('');
//   const [dbName, setDbName] = useState('');
//   const [optionIdx, setOptionIdx] = useState(null);

//   // Suggestions for connection options
//   const mongoOptions = [
//     { label: 'Safe writes (recommended)', value: 'retryWrites=true&w=majority' },
//     { label: 'Allow unsafe writes', value: 'retryWrites=false&w=1' },
//     { label: 'Enable TLS/SSL', value: 'tls=true' },
//   ];
//   const sqlOptions = [
//     { label: 'Default (no extra options)', value: '' },
//     { label: 'Require SSL', value: 'sslmode=require' },
//     { label: 'Connect with statement timeout', value: 'statement_timeout=5000' },
//   ];

//   const handleFileUpload = async (e) => {
//     // console.log('File upload initiated', e.target.files?.[0]);
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setUploading(true);
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('conversationId', conversationId || '');

//     // console.log('FormData content:');
//     // for (const [key, value] of formData.entries()) {
//     //   console.log(`${key}:`, value);
//     // }

//     try {
//       const res = await fetch('/api/upload-dataset', { method: 'POST', body: formData });
//       const data = await res.json();
//       if (data.success) { onDatasetAdded(data.dataset); onClose(); }
//     } catch (err) { alert('Upload failed'); }
//     finally { setUploading(false); }
//   };

//   const handleConnect = async () => {
//     if (!dbName.trim()) { alert('Enter database name'); return; }
//     let finalConnStr = connStr.trim();
//     let options = '';
//     if (dbType === 'mongodb') {
//       // Build MongoDB connection string
//       // Example: mongodb+srv://user:pass@host/dbName?options
//       options = optionIdx !== null ? mongoOptions[optionIdx].value : '';
//       finalConnStr = finalConnStr.replace(/\/$/, ''); // remove trailing slash
//       finalConnStr = `${finalConnStr}/${dbName}`;
//       if (options) finalConnStr += `?${options}`;
//     } else if (dbType === 'sql') {
//       // Build SQL connection string
//       // Example: postgres://user:pass@host:port/dbName?options
//       options = optionIdx !== null ? sqlOptions[optionIdx].value : '';
//       finalConnStr = finalConnStr.replace(/\/$/, '');
//       finalConnStr = `${finalConnStr}/${dbName}`;
//       if (options) finalConnStr += `?${options}`;
//     }
//     if (!finalConnStr.trim()) { alert('Enter connection string'); return; }
//     console.log(`Connecting to ${dbType} with connection string: ${finalConnStr}`);
//     setUploading(true);
//     try {
//       const res = await fetch('/api/connect-database', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ connectionString: finalConnStr, type: dbType, conversationId })
//       });
//       const data = await res.json();
//       console.log('Connection String successfully inserted in db:', data);
//       if (data.success) {
//         onDatasetAdded(data.dataset);
//         onClose();
//         setConnStr('');
//         setDbName('');
//         setOptionIdx(null);
//       } else {
//         alert(data.error);
//       }
//     } catch (err) {
//       console.error('Connection failed:', err); alert('Connection failed');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Add Data Source</DialogTitle>
//         </DialogHeader>
//         <Tabs defaultValue="file">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="file"><Upload className="w-4 h-4 mr-2" /> Upload</TabsTrigger>
//             <TabsTrigger value="db"><Database className="w-4 h-4 mr-2" /> Database</TabsTrigger>
//           </TabsList>
//           <TabsContent value="file">
//             <Label>Excel or CSV or PDF or DOCX</Label>
//             <Input type="file" accept=".xlsx,.xls,.csv,.pdf,.docx" onChange={handleFileUpload} disabled={uploading} className="mt-2" />
//           </TabsContent>
//           <TabsContent value="db" className="space-y-4">
//             <div>
//               <Label>Type</Label>
//               <select value={dbType} onChange={e => { setDbType(e.target.value); setOptionIdx(null); }} className="w-full border rounded p-2 mt-2">
//                 <option value="sql">SQL</option>
//                 <option value="mongodb">MongoDB</option>
//               </select>
//             </div>
//             <div>
//               <Label>Connection String (without database name or options)</Label>
//               <Input value={connStr} onChange={e => setConnStr(e.target.value)} placeholder={dbType === 'mongodb' ? 'e.g. mongodb+srv://user:pass@host' : 'e.g. postgres://user:pass@host:port'} className="mt-2" />
//             </div>
//             <div>
//               <Label>Database Name</Label>
//               <Input value={dbName} onChange={e => setDbName(e.target.value)} placeholder="Enter database name" className="mt-2" />
//             </div>
//             <div>
//               <Label>Connection Options</Label>
//               <select value={optionIdx !== null ? optionIdx : ''} onChange={e => setOptionIdx(e.target.value !== '' ? Number(e.target.value) : null)} className="w-full border rounded p-2 mt-2">
//                 <option value="">Select an option (optional)</option>
//                 {(dbType === 'mongodb' ? mongoOptions : sqlOptions).map((opt, idx) => (
//                   <option key={opt.value} value={idx}>{opt.label}</option>
//                 ))}
//               </select>
//               <div className="text-xs text-gray-500 mt-1">
//                 {optionIdx !== null && (dbType === 'mongodb' ? mongoOptions : sqlOptions)[optionIdx]?.label}
//               </div>
//             </div>
//             <Button onClick={handleConnect} disabled={uploading} className="w-full">{uploading ? 'Connecting...' : 'Connect'}</Button>
//           </TabsContent>
//         </Tabs>
//       </DialogContent>
//     </Dialog>
//   );
// }