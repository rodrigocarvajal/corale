import React from 'react';

function ResetButton(props) {

    const onClickResetPage = () => {
        window.location.reload();
    };

    return (
        <React.Fragment>
            <div className="row">
                <div className="offset-1 col-1 resetToggle" onClick={onClickResetPage}>
                    Reset
                </div>
            </div>
            <p/>
        </React.Fragment>
    )
}

export default ResetButton
