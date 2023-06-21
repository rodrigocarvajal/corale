import React, { useEffect } from 'react';
import routes from '../../resources/json/routes.json';

function Heatmap(props) {

    const [imgUrl, setImgUrl] = React.useState();

    useEffect(() => {
        setImgUrl(process.env.REACT_APP_FLASK_HOST + ':' + process.env.REACT_APP_FLASK_PORT + process.env.REACT_APP_FLASK_PROXY_URL_PREFIX + routes.server.root + routes.server.clustermapGet + '?jobId=' + props.data.results.jobId + '&img=' + props.data.results.filename);
    }, [props.data]);
    return (
        <React.Fragment>
            {imgUrl &&
                <React.Fragment>
                    {!props.data.results.noClinicalFeature &&
                        <div className="row justify-content-end">
                            <div className="col-2 legendOutline">
                                <span className="boldFieldHeader">Feature: </span>{props.data.results.feature}
                                {Object.keys(props.data.results.legend).map((key, i) => {
                                    return (
                                        <div className="row" key={i}>
                                            <div className="legendBlock" style={{backgroundColor: props.data.results.legend[key]}}/>
                                            <label>{key}</label>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    }
                    <div className="row">
                        <div className="col-12">
                            <img className="col-12" src={imgUrl} alt={props.data.results.filename}/>
                        </div>
                    </div>
                </React.Fragment>
            }
        </React.Fragment>
    )
}

export default Heatmap
