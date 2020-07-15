import React from "react";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faDatabase, faLongArrowAltUp, faLongArrowAltDown, faEnvelope, faArrowsAltV,
    faFilter, faDownload, faCogs, faPlug, faTv, faBalanceScale, faLink, faUpload, faFileExport
} from '@fortawesome/free-solid-svg-icons'
import StatusIndicator from "./StatusIndicator";

class StatusOverview extends React.Component {

    render() {
        return (
            <table align="center">
                <tbody>
                <tr>
                    <td colSpan="2"/>
                    <td colSpan="2" className="border">
                        <FontAwesomeIcon icon={faDatabase}/>
                    </td>
                    <td/>
                </tr>
                <tr>
                    <td colSpan="2"/>
                    <td>
                        <FontAwesomeIcon icon={faLongArrowAltUp}/>
                    </td>
                    <td>
                        <FontAwesomeIcon icon={faLongArrowAltDown}/>
                    </td>
                    <td/>
                </tr>
                <tr>
                    <td className="overviewColumn">
                        <StatusIndicator
                            name="Prepare"
                            icon={faFilter}
                            service={this.props.services.Prepare}
                        />
                    </td>
                    <td className="overviewColumn">
                        <StatusIndicator
                            name="Import"
                            icon={faDownload}
                            service={this.props.services.Import}
                        />
                    </td>
                    <td className="overviewColumn">
                        <StatusIndicator
                            name="Workflow"
                            icon={faCogs}
                            service={this.props.services.Workflow}
                        />
                    </td>
                    <td className="overviewColumn">
                        <StatusIndicator
                            name="BeheerAPI"
                            icon={faPlug}
                            service={this.props.services.BeheerAPI}
                        />
                    </td>
                    <td className="overviewColumn">
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
                    <td className="overviewColumn">
                        <StatusIndicator
                            reversed="true"
                            name="Compare"
                            icon={faBalanceScale}
                            service={this.props.services.Upload}
                        />
                    </td>
                    <td className="overviewColumn">
                        <StatusIndicator
                            reversed="true"
                            name="Relate"
                            icon={faLink}
                            service={this.props.services.Upload}
                        />
                    </td>
                    <td className="overviewColumn">
                        <StatusIndicator
                            reversed="true"
                            reversedIcon="true"
                            name="Upload"
                            icon={faUpload}
                            service={this.props.services.Upload}
                        />
                    </td>
                    <td className="overviewColumn">
                        <StatusIndicator
                            reversed="true"
                            reversedIcon="true"
                            name="API"
                            icon={faPlug}
                            service={this.props.services.API}
                        />
                    </td>
                    <td className="overviewColumn">
                        <StatusIndicator
                            reversed="true"
                            name="Export"
                            icon={faFileExport}
                            service={this.props.services.Export}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <FontAwesomeIcon icon={faLongArrowAltUp}/>
                    </td>
                    <td>
                        <FontAwesomeIcon icon={faLongArrowAltUp}/>
                    </td>
                    <td>
                        <FontAwesomeIcon icon={faArrowsAltV}/>
                    </td>
                    <td>
                        <FontAwesomeIcon icon={faLongArrowAltUp}/>
                    </td>
                    <td/>
                </tr>
                <tr>
                    <td colSpan="4" className="border">
                        <FontAwesomeIcon icon={faDatabase}/>
                    </td>
                    <td/>
                </tr>
                </tbody>
            </table>
        )
    }
}

export default StatusOverview;
