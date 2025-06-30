
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Database, Upload, CheckCircle, AlertCircle, Flag, X, Plus, Circle } from "lucide-react"; // Added Circle import
import { importNZFoodFiles } from "@/api/functions";

export default function AdminImportPanel({ onImportComplete }) {
    const [isImporting, setIsImporting] = useState(false);
    const [importStatus, setImportStatus] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [importMode, setImportMode] = useState('sample');
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        if (newFiles.length > 0) {
            const validFiles = newFiles.filter(file => 
                file.type === "text/csv" || file.name.endsWith('.csv') || 
                file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') ||
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            
            if (validFiles.length !== newFiles.length) {
                setImportStatus({
                    type: 'error',
                    message: 'Invalid File Type',
                    details: 'One or more files were not valid CSV or Excel files. Only valid files were added.'
                });
            }

            // Add new files to existing selection (avoiding duplicates)
            setSelectedFiles(prevFiles => {
                const existingNames = new Set(prevFiles.map(f => f.name));
                const newUniqueFiles = validFiles.filter(f => !existingNames.has(f.name));
                return [...prevFiles, ...newUniqueFiles];
            });
            
            if (validFiles.length > 0) {
                setImportStatus(null);
            }
        }
        
        // Reset the input value so the same files can be selected again if needed
        event.target.value = '';
    };

    const removeFile = (indexToRemove) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const clearAllFiles = () => {
        setSelectedFiles([]);
        setImportStatus(null);
    };

    const handleNZFoodImport = async () => {
        if (selectedFiles.length === 0) {
            setImportStatus({ type: 'error', message: 'No files selected', details: 'Please choose one or more files to import.' });
            return;
        }

        // Check if we have the required files
        const hasNameFile = selectedFiles.some(f => f.name.toUpperCase().includes('NAME') && f.name.toUpperCase().includes('.FT'));
        const hasDataFile = selectedFiles.some(f => f.name.toUpperCase().includes('DATA') && f.name.toUpperCase().includes('.AP'));
        
        if (!hasNameFile) {
            setImportStatus({ 
                type: 'error', 
                message: 'Missing required file', 
                details: 'Please include the NAME.FT.xlsx file containing food names and IDs.' 
            });
            return;
        }
        
        if (!hasDataFile) {
            setImportStatus({ 
                type: 'error', 
                message: 'Missing required file', 
                details: 'Please include the Standard DATA.AP.xlsx file containing nutritional values.' 
            });
            return;
        }

        setIsImporting(true);
        setImportStatus({ type: 'info', message: 'Starting import...', details: 'Processing your files, please wait.' });
        
        try {
            // Send ALL files at once, not one at a time
            const formData = new FormData();
            
            // Add all selected files to the same FormData
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            formData.append('mode', importMode);

            console.log('Uploading files:', selectedFiles.map(f => f.name));

            const response = await importNZFoodFiles(formData);
            console.log('Import response:', response);
            
            if (response.data && response.data.success) {
                setImportStatus({ 
                    type: 'success', 
                    message: `Import Complete!`,
                    details: `Successfully imported ${response.data.inserted_count} foods. ${response.data.note || ''}`
                });
                if (onImportComplete) onImportComplete();
                
                // Clear files after successful import
                setSelectedFiles([]);
            } else {
                setImportStatus({
                    type: 'error',
                    message: response.data?.error || 'Import failed',
                    details: response.data?.details || 'Please check your file formats and try again.'
                });
            }
            
        } catch (error) {
            console.error('Import error:', error);
            setImportStatus({
                type: 'error',
                message: `Import failed: ${error.message}`,
                details: 'Please check the file format and try again.'
            });
        }
        
        setIsImporting(false);
    };

    return (
        <div className="space-y-6">
            {/* NZ Food Files Import */}
            <Card className="glass-card shadow-lg border-0 bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-green-800 flex items-center gap-2">
                        <Flag className="w-6 h-6" />
                        Admin: NZ Food Files Import
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-white/70 rounded-lg p-4 border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2">Instructions:</h3>
                        <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
                            <li>Upload ALL required NZ Food Files: <strong>NAME.FT.xlsx</strong>, <strong>Standard DATA.AP.xlsx</strong>, and <strong>Standard CODE.FT.xlsx</strong></li>
                            <li>Select all files at once using Ctrl+Click or Cmd+Click</li>
                            <li>Files are processed together to create complete food records</li>
                            <li>Sample mode imports up to 100 records, Full mode up to 2000 records</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-green-800">Import Mode</label>
                                <Select value={importMode} onValueChange={setImportMode}>
                                    <SelectTrigger className="h-10 border-2 border-green-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sample">Sample Import (100 records max)</SelectItem>
                                        <SelectItem value="full">Full Import (2000 records max)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* File selection area */}
                        <div className="space-y-4">
                            <Input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                className="hidden"
                                multiple
                            />
                            
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => fileInputRef.current.click()}
                                    variant="outline"
                                    className="h-12 border-2 border-dashed border-green-400 text-green-600 hover:bg-green-100 flex-1"
                                    disabled={isImporting}
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    {selectedFiles.length === 0 ? 'Select ALL Required Files' : 'Add More Files'}
                                </Button>
                                
                                {selectedFiles.length > 0 && (
                                    <Button
                                        onClick={clearAllFiles}
                                        variant="outline"
                                        className="h-12 border-2 border-red-300 text-red-600 hover:bg-red-100"
                                        disabled={isImporting}
                                    >
                                        <X className="w-5 h-5 mr-2" />
                                        Clear All
                                    </Button>
                                )}
                            </div>

                            {/* Required files checklist */}
                            <div className="bg-white rounded-lg border border-green-200 p-4">
                                <h4 className="font-semibold text-green-800 mb-3">Required Files:</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {selectedFiles.some(f => f.name.toUpperCase().includes('NAME') && f.name.toUpperCase().includes('.FT')) ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        )}
                                        <span className="text-sm">NAME.FT.xlsx (Food names and IDs)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedFiles.some(f => f.name.toUpperCase().includes('DATA') && f.name.toUpperCase().includes('.AP')) ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        )}
                                        <span className="text-sm">Standard DATA.AP.xlsx (Nutritional values)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedFiles.some(f => f.name.toUpperCase().includes('CODE') && f.name.toUpperCase().includes('.FT')) ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-gray-400" />
                                        )}
                                        <span className="text-sm">Standard CODE.FT.xlsx (Optional - Unit codes)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Selected files display */}
                            {selectedFiles.length > 0 && (
                                <div className="bg-white rounded-lg border border-green-200 p-4">
                                    <h4 className="font-semibold text-green-800 mb-3">
                                        Selected Files ({selectedFiles.length})
                                    </h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                                                <span className="text-sm text-green-700 truncate flex-1 mr-2">
                                                    {file.name} ({Math.round(file.size / 1024 / 1024 * 10) / 10}MB)
                                                </span>
                                                <Button
                                                    onClick={() => removeFile(index)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                    disabled={isImporting}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={handleNZFoodImport}
                            disabled={isImporting || selectedFiles.length === 0}
                            className="h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                            {isImporting ? (
                                <>
                                    <Database className="w-5 h-5 mr-2 animate-pulse" />
                                    Processing Files...
                                </>
                            ) : (
                                <>
                                    <Database className="w-5 h-5 mr-2" />
                                    Import {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </Button>

                        {importStatus && (
                            <div className={`p-4 rounded-lg border ${
                                importStatus.type === 'success' 
                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                    : importStatus.type === 'info'
                                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {importStatus.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : 
                                     importStatus.type === 'info' ? <Database className="w-5 h-5 text-blue-600 animate-pulse" /> :
                                     <AlertCircle className="w-5 h-5 text-red-600" />}
                                    <span className="font-semibold">{importStatus.message}</span>
                                </div>
                                {importStatus.details && <p className="text-sm mt-2">{importStatus.details}</p>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
