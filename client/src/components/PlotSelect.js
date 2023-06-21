import React, {useEffect} from 'react'
import sessionj from '../resources/json/session.json';

function PlotSelect(props) {

    const INIT_PLOT_TYPE = 'km';

    const [isGseaSelected, setIsGseaSelected] = React.useState(false);

    useEffect(() => {
        sessionStorage.setItem(sessionj.plotSelection, INIT_PLOT_TYPE);
    },[]);

    const onChangeRadio = e => {
        props.plotSelect$.next(e.target.value);
        sessionStorage.setItem(sessionj.plotSelection, e.target.value);
        if (e.target.value === 'gsea') {
            setIsGseaSelected(true);
        } else {
            setIsGseaSelected(false);
            sessionStorage.setItem(sessionj.gseaGeneset, '');
        }
    };

    const onChangeGseaGeneset = e => {
        sessionStorage.setItem(sessionj.gseaGeneset, e.target.value);
    };

    return (
        <React.Fragment>
            <div className="row">
                <h4>Plot Select:</h4>
            </div>
            <p/>
            <div className="row">
                <div className="col-11">
                    <label className="col-2 boldFieldHeader" htmlFor="plotTypeHeader">Plot Type:</label>
                    <input type="radio" className="radioLeftMargin" id="kaplanMeier" name="plotType" value={INIT_PLOT_TYPE} defaultChecked onChange={onChangeRadio} />
                    <label htmlFor="kaplanMeier">Kaplan-Meier</label>
                    <input type="radio" className="radioLeftMargin" id="boxplot" name="plotType" value="boxplot" onChange={onChangeRadio} />
                    <label htmlFor="boxplot">Boxplot</label>
                    <input type="radio" className="radioLeftMargin" id="violin" name="plotType" value="violin" onChange={onChangeRadio} />
                    <label htmlFor="violin">Violin</label>
                    <input type="radio" className="radioLeftMargin" id="correlation" name="plotType" value="correlation" onChange={onChangeRadio} />
                    <label htmlFor="correlation">Correlation</label>
                    <input type="radio" className="radioLeftMargin" id="gsea" name="plotType" value="gsea" onChange={onChangeRadio} />
                    <label htmlFor="gsea">GSEA</label>
                </div>
            </div>
            {isGseaSelected &&
                <div className="row">
                    <div className="col-11">
                        <label className="col-2 boldFieldHeader" htmlFor="gseaGenesetHeader">Geneset:</label>
                        <input type="radio" className="radioLeftMargin" id="gseaGenesetHallmark" name="gseaGeneset" value="hallmark" onChange={onChangeGseaGeneset}/>
                        <label htmlFor="gseaGenesetHallmark">Hallmark</label>
                        <input type="radio" className="radioLeftMargin" id="gseaGenesetKegg" name="gseaGeneset" value="kegg" onChange={onChangeGseaGeneset}/>
                        <label htmlFor="gseaGenesetKegg">KEGG</label>
                    </div>
                </div>
            }
        </React.Fragment>
    )
}

export default PlotSelect
