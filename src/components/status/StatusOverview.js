import React from "react";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faDatabase, faLongArrowAltUp, faLongArrowAltDown, faEnvelope, faArrowsAltV,
    faFilter, faDownload, faCogs, faPlug, faTv, faBalanceScale, faLink, faUpload, faFileExport
} from '@fortawesome/free-solid-svg-icons'
import StatusIndicator from "./StatusIndicator";

class StatusOverview extends React.Component {

    render() {
        const width = n => ({width: n});
        return (
            <table align="center">
                <tbody>
                <tr>
                    <td style={width(40)} colSpan="2"/>
                    <td style={width(40)} colSpan="2" className="border">
                        <FontAwesomeIcon icon={faDatabase}/>
                    </td>
                    <td style={width(20)}/>
                </tr>
                <tr>
                    <td style={width(40)} colSpan="2"/>
                    <td style={width(20)}>
                        <FontAwesomeIcon icon={faLongArrowAltUp}/>
                    </td>
                    <td style={width(20)}>
                        <FontAwesomeIcon icon={faLongArrowAltDown}/>
                    </td>
                    <td style={width(20)}/>
                </tr>
                <tr>
                    <td style={width(20)}>
                        <StatusIndicator
                            name="Prepare"
                            icon={faFilter}
                            service={this.props.services.Prepare}
                        />
                    </td>
                    <td style={width(20)}>
                        <StatusIndicator
                            name="Import"
                            icon={faDownload}
                            service={this.props.services.Import}
                        />
                    </td>
                    <td style={width(20)}>
                        <StatusIndicator
                            name="Workflow"
                            icon={faCogs}
                            service={this.props.services.Workflow}
                        />
                    </td>
                    <td style={width(20)}>
                        <StatusIndicator
                            name="BeheerAPI"
                            icon={faPlug}
                            service={this.props.services.BeheerAPI}
                        />
                    </td>
                    <td style={width(20)}>
                        <StatusIndicator
                            name="IRIS"
                            icon={faTv}
                            service={this.props.services.IRIS}
                        />
                    </td>
                </tr>
                <tr>
                    <td colSpan="5" className="border">
                        <FontAwesomeIcon icon={faEnvelope}/>
                    </td>
                </tr>
                <tr>
                    <td style={width(20)}>
                        <StatusIndicator
                            reversed="true"
                            name="Compare"
                            icon={faBalanceScale}
                            service={this.props.services.Upload}
                        />
                    </td>
                    <td style={width(20)}>
                        <StatusIndicator
                            reversed="true"
                            name="Relate"
                            icon={faLink}
                            service={this.props.services.Upload}
                        />
                    </td>
                    <td style={width(20)}>
                        <StatusIndicator
                            reversed="true"
                            reversedIcon="true"
                            name="Upload"
                            icon={faUpload}
                            service={this.props.services.Upload}
                        />
                    </td>
                    <td style={width(20)}>
                        <StatusIndicator
                            reversed="true"
                            reversedIcon="true"
                            name="API"
                            icon={faPlug}
                            service={this.props.services.API}
                        />
                    </td>
                    <td style={width(20)}>
                        <StatusIndicator
                            reversed="true"
                            name="Export"
                            icon={faFileExport}
                            service={this.props.services.Export}
                        />
                    </td>
                </tr>
                <tr>
                    <td style={width(20)}>
                        <FontAwesomeIcon icon={faLongArrowAltUp}/>
                    </td>
                    <td style={width(20)}>
                        <FontAwesomeIcon icon={faLongArrowAltUp}/>
                    </td>
                    <td style={width(20)}>
                        <FontAwesomeIcon icon={faArrowsAltV}/>
                    </td>
                    <td style={width(20)}>
                        <FontAwesomeIcon icon={faLongArrowAltUp}/>
                    </td>
                    <td style={width(20)}/>
                </tr>
                <tr>
                    <td style={width(80)} colSpan="4" className="border">
                        <FontAwesomeIcon icon={faDatabase}/>
                    </td>
                    <td style={width(20)}/>
                </tr>
                </tbody>
            </table>
        )
    }
}

export default StatusOverview;
