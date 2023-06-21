import React from 'react';

function Tutorial() {

    const USER_MANUAL_URL = process.env.REACT_APP_FILESERVER_HOST + ':' + process.env.REACT_APP_FILESERVER_PORT + process.env.REACT_APP_FILESERVER_CORALE_USER_MANUAL_PATH + '/' + process.env.REACT_APP_USER_MANUAL;
    const VIDEO_TUTORIAL_URL = process.env.REACT_APP_FILESERVER_HOST + ':' + process.env.REACT_APP_FILESERVER_PORT + process.env.REACT_APP_FILESERVER_CORALE_TUTORIAL_VIDEO_PATH + '/' + process.env.REACT_APP_TUTORIAL_VIDEO;
  
    return (
        <React.Fragment>
            <h4 className="textAlignCenter">
                Video Tutorial
            </h4>
            <div className="lineDivideSm"/>
            <p/>
            <video className="embedVideo" controls="controls" src={VIDEO_TUTORIAL_URL}></video>
            <div className="spacer"/>
            <div className="lineDivideSm"/>
            <h4 className="textAlignCenter">
                User Manual
            </h4>
            <div className="lineDivideSm"/>
            <div className="textAlignCenter">
                <a href={USER_MANUAL_URL}>View in full page</a>
            </div>
            <p/>
            <embed type="application/pdf" src={USER_MANUAL_URL} className="embedPdf"/> 
        </React.Fragment>
    );
}

export default Tutorial
