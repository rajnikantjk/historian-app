import React, { useCallback, useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Spinner } from 'reactstrap';
import { useDropzone } from 'react-dropzone';

export const FileUploadModal = ({ isOpen, toggle, onFileUpload, loading }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a valid CSV file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleToggle = () => {
    setFile(null); // Clear the file when modal is toggled (closed)
    toggle();
  };

  const handleUpload = () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResult = onFileUpload(formData);
      
      // Check if the upload returns a Promise
      if (uploadResult && typeof uploadResult.then === 'function') {
        uploadResult.then(() => {
          setFile(null);
        }).catch(error => {
          console.error('Upload failed:', error);
        });
      } else {
        // If it doesn't return a Promise, just clear the file
        setFile(null);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={handleToggle} centered>
      <ModalHeader toggle={handleToggle}>Import Tags</ModalHeader>
      <ModalBody>
        <div className="text-center mb-4">
          <p>Upload a CSV file containing your tags. <a href="/taglistupload.csv" download>Download sample template</a></p>
        </div>
        
        <div 
          {...getRootProps()} 
          className={`border rounded p-5 text-center ${isDragActive ? 'border-primary' : 'border-dashed'}`}
          style={{ cursor: 'pointer' }}
        >
          <input {...getInputProps()} />
          {file ? (
            <div>
              <i className="ri-file-text-line ri-3x text-primary mb-2"></i>
              <p className="mb-1">{file.name}</p>
              <p className="text-muted small">Click to change file</p>
            </div>
          ) : (
            <div>
              <i className="ri-upload-cloud-2-line ri-3x text-muted mb-2"></i>
              <p className="mb-1">Drag & drop your file here, or click to select</p>
              <p className="text-muted small">Only CSV files are accepted</p>
            </div>
          )}
        </div>
        
        {error && <div className="text-danger mt-2">{error}</div>}
        
        <div className="d-flex justify-content-end mt-4">
          <Button color="light" className="me-2" onClick={handleToggle} disabled={loading}>
            Cancel
          </Button>
          <Button 
            color="primary" 
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" /> Uploading...
              </>
            ) : 'Upload'}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default FileUploadModal;
