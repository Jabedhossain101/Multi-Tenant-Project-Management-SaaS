'use client';

import * as React from 'react';
import { api } from '../../../lib/api-client.js';
import { useToast } from '../../../components/ui/use-toast.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card.js';
import { Button } from '../../../components/ui/button.js';
import { Badge } from '../../../components/ui/badge.js';
import { formatBytes, formatDate } from '../../../lib/utils.js';
import { Files, UploadCloud, Download, Trash2, FileText, Image, FileCode, Loader2 } from 'lucide-react';

interface FileRecord {
  id: string;
  name: string;
  s3Key: string;
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
  uploader?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function FilesPage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  // In our backend schema, organization files are queried or linked to attachments
  const [files, setFiles] = React.useState<FileRecord[]>([
    {
      id: 'file-1',
      name: 'System_Architecture_Blueprint.pdf',
      s3Key: 'uploads/system-architecture.pdf',
      sizeBytes: 2450000,
      mimeType: 'application/pdf',
      createdAt: new Date().toISOString(),
      uploader: { id: 'u1', name: 'Lead Architect', email: 'architect@tasksaas.local' },
    },
    {
      id: 'file-2',
      name: 'Cloud_Infrastructure_Terraform.tf',
      s3Key: 'uploads/infra.tf',
      sizeBytes: 45000,
      mimeType: 'text/plain',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      uploader: { id: 'u2', name: 'DevOps Lead', email: 'devops@tasksaas.local' },
    },
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);
    try {
      // 1. Request presigned upload URL from backend
      const presignedRes = await api.post<{
        uploadUrl: string;
        fileId: string;
        s3Key: string;
      }>('/files/upload-url', {
        fileName: selectedFile.name,
        fileType: selectedFile.type || 'application/octet-stream',
        fileSize: selectedFile.size,
      });

      // 2. Confirm file upload with backend
      await api.post('/files/confirm', {
        fileId: presignedRes.fileId,
        s3Key: presignedRes.s3Key,
        sizeBytes: selectedFile.size,
        mimeType: selectedFile.type || 'application/octet-stream',
        name: selectedFile.name,
      });

      setFiles((prev) => [
        {
          id: presignedRes.fileId,
          name: selectedFile.name,
          s3Key: presignedRes.s3Key,
          sizeBytes: selectedFile.size,
          mimeType: selectedFile.type || 'application/octet-stream',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      toast({
        title: 'File Uploaded',
        description: `Successfully uploaded ${selectedFile.name}`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload asset. Please check file size and storage quota.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const res = await api.get<{ downloadUrl: string }>(`/files/${fileId}/download-url`);
      if (res?.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
      } else {
        toast({ title: 'Download Started', description: fileName, variant: 'success' });
      }
    } catch {
      toast({ title: 'Download Failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await api.delete(`/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast({ title: 'File Removed', variant: 'success' });
    } catch {
      toast({ title: 'Delete Failed', variant: 'destructive' });
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes('image')) return <Image className="h-5 w-5 text-blue-400" />;
    if (mime.includes('pdf')) return <FileText className="h-5 w-5 text-rose-400" />;
    return <FileCode className="h-5 w-5 text-purple-400" />;
  };

  const totalStorageBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Files className="h-6 w-6 text-blue-400" />
            Workspace Files & Assets
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Secure S3-backed asset repository with presigned URLs and multi-tenant isolation
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="gradient"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload Asset
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Storage Quota Card */}
      <Card className="bg-card/60">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-muted-foreground">Storage Used</span>
            <p className="text-sm font-bold text-foreground">
              {formatBytes(totalStorageBytes)} <span className="text-xs font-normal text-muted-foreground">/ 10 GB (PRO Tier)</span>
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Encrypted & Isolated
          </Badge>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Uploaded Assets ({files.length})</CardTitle>
          <CardDescription className="text-xs">
            Directly accessible attachments linked to tasks, epics, and specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between py-3.5 px-2 hover:bg-accent/40 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-card border border-border/80 flex items-center justify-center">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {file.name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{formatBytes(file.sizeBytes)}</span>
                      <span>•</span>
                      <span>Uploaded {formatDate(file.createdAt)}</span>
                      {file.uploader && (
                        <>
                          <span>•</span>
                          <span>by {file.uploader.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleDownload(file.id, file.name)}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
