import ManagementPage from "./index";
import React from "react";
import {getByLabelText, render, screen} from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

jest.mock("./JobStart", () => () => {
    const MockName = "job-start-mock";
    return <MockName />
});

describe("ManagementPage", () => {
    it("should filter out hidden collections", () => {
        const props = {
            catalog: "gebieden",
            catalogCollections: {
                gebieden: ["bouwblokken", "buurten", "ggpgebieden", "ggwgebieden"],
            },
            collections: [],
            hideCollections: {
                gebieden: ["ggpgebieden"],
            },
            catalogOnlyActions: [],
            actions: [],
        }
        const mockStore = configureStore([]);
        const store = mockStore({});

        render(<Provider store={store}><ManagementPage {...props} /></Provider>)

        const expected = ["bouwblokken", "buurten", "ggwgebieden"];

        expected.forEach(collection => expect(screen.getByLabelText(collection)).toBeDefined());
        expect(() => getByLabelText("ggpgebieden")).toThrow();
    });

})