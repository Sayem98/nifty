import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.2.146/pdf.worker.min.js`;

function PDFViewer() {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages}) {
    setNumPages(numPages);
  }

  const [wallet, setWallet] = useState("")
  const [id, setId] = useState("")

  const [pdfData, setPdfData] = useState(null);

  async function pdfFetcher(){
    try{
      const res = await axios.get(`https://niftytales.s3.us-east-1.amazonaws.com/users/${wallet}/content/${id}/book`);
      // console.log(res);
    }
    catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
      setWallet(localStorage?.getItem('address') || "");
      setId(localStorage?.getItem('id') || "")
      pdfFetcher();
  }, [])

  return (
    <div>
      <Document
        file={`https://niftytales.s3.us-east-1.amazonaws.com/users/${wallet}/content/${id}/book`}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
      <p>Total Pages: {numPages}</p>
    </div>
  );
}

export default PDFViewer;