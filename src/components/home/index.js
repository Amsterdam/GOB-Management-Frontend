import React from "react";
import {Card, CardContent, Paragraph} from "@datapunt/asc-ui";
import logo from "./logo.png"

const HomePage = () => {
    return (
        <div className="text-center mt-5">
            <Card backgroundColor="level2" shadow>
                <CardContent>
                    <Paragraph>
                        <img alt="GOB logo" src={logo} />
                    </Paragraph>
                    <Paragraph>
                        <b>G</b>enerieke <b>O</b>ntsluiting <b>B</b>asisgegevens
                    </Paragraph>
                    <Paragraph>
                        Conform het<br />
                        <a href="https://www.amsterdam.nl/stelselpedia/" target="_blank" rel="noopener noreferrer">
                            Stelsel van BasisRegistraties
                        </a>
                    </Paragraph>
                </CardContent>
            </Card>
        </div>
    )
}

export default HomePage;
