import React from 'react';
import HttpService from '../services/HttpService';
import routes from '../resources/json/routes.json';
import ZipSVG from '../resources/svg/file-archive-regular.svg';

function ZipAndDownloadGSEA(props) {

    const JOBS_DIRECTORY_BASENAME = '/jobs';
    const GSEA_ARCHIVE_FILENAME = '/gsea_archive.zip';


    const [showCompressingMsg, setShowCompressingMsg] = React.useState(false);
    const [downloadZip, setDownloadZip] = React.useState(false);

    const onClickArchiveDownload = () => {
        setDownloadZip(false);
        setShowCompressingMsg(true);
        HttpService.post(routes.server.root + routes.server.gseaArchiveGet, { jobId: props.jobId })
            .then(res => {
                setDownloadZip(true);
                setShowCompressingMsg(false);
            });
    };

    const downloadUri = () => {
        let link = document.createElement('a');
        link.href = process.env.REACT_APP_FILESERVER_HOST + ':' + process.env.REACT_APP_FILESERVER_PORT + JOBS_DIRECTORY_BASENAME + '/' + props.jobId + GSEA_ARCHIVE_FILENAME;
        link.click();
        link.remove();
    };

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-6">
                    <span style={{cursor: 'pointer'}} onClick={onClickArchiveDownload}><img src={ZipSVG} className="zipFileIcon" alt="zip-file-svg" /> Download Archive</span>
                </div>
            </div>   
            {showCompressingMsg &&
                <div className="row">
                    <div className="col-6 attentionMessage">Compressing archive...</div>
                </div>
            }
            {downloadZip &&
                downloadUri()
            }
        </React.Fragment>
    )
}

export default ZipAndDownloadGSEA
