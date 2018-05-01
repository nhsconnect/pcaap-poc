import { ClientConnector, IEvent } from "dw-client-connector";

// tslint:disable-next-line:only-arrow-functions
(function () {
    ClientConnector.init("http://localhost:3102", "http://localhost:3000");
    ClientConnector.subscribe("test-message", (data) => {
        console.log("SUPP-REC", data);

        const list = document.querySelector("#msg-list");
        const listItem = document.createElement("li");
        listItem.textContent = data;
        list.appendChild(listItem);
    });
})();

export const sendTest = () => {
    const event: IEvent = {
        name: "test-message",
        version: "0.0.1",
        data: "message from SUPPLIER"
    };

    ClientConnector.publish(event);

    const rouge: IEvent = {
        name: "rogue-message",
        version: "0.0.1",
        data: "message from SUPPLIER"
    };
    ClientConnector.publish(rouge);
};