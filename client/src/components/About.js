import React from 'react'

function About() {
    return (
        <React.Fragment>
            <h4 className="textAlignCenter">Citation</h4>
            <div className="lineDivideSm"/>
            <div className="" style={{width: '60vw', marginLeft: '20vw'}}>
                Kyubum Lee, Mengyu Xie, Scott D. Cukras, John H. Lockhart, Rodrigo Carvajal, Elsa R. Flores, 
                Christine H. Chung, and Aik-Choon Tan, 
                <b> Comprehensive Oral Cancer Explorer (CORALE): A user-friendly web-based oral cancer data analysis portal.</b><i>[Under Review] (2021)</i>
            </div>
            <div className="spacer"/>
            <h4 className="textAlignCenter">Contact</h4>
            <div className="lineDivideSm"/>
            <div className="" style={{marginLeft: '20vw'}}>
                <ul>
                    <li><a href="mailto:AikChoon.Tan@moffitt.org">Aik Choon Tan, PhD</a></li>
                    <li><a href="mailto:Kyubum.Lee@moffitt.org">Kyubum Lee, PhD</a></li>
                </ul>
            </div>
        </React.Fragment>
    )
}

export default About
