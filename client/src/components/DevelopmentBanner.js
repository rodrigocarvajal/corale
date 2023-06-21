import React from 'react'

function DevelopmentBanner() {
    const count = [1,2,3,4];
    return (
        <React.Fragment>
            {process.env.REACT_APP_PRODUCTION === 'false' &&
                <div className="row justify-content-cetner devBanner">
                {count.map(i => {
                    return (
                        <div className="col-3 devBannerItem" key={i}>DEVELOPMENT</div>
                    )
                })}
                </div>
            }
        </React.Fragment>
    )
}

export default DevelopmentBanner
