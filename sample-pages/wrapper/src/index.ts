import { Catalogue } from "./app-catalogue/catalogue";

interface IEvent {
    name: string;
    data: any;
}

interface IClient {
    id: string;
    name: string;
    metadata: Catalogue.IClientMetadata;
    registered: boolean;
    port: MessagePort;
}

class ClientStateManager {
    get() {
        return this.clients;
    }

    set(clients: Catalogue.IClientMetadata[]) {
        this.clients =
            clients.map(x => {
                return {
                    id: x.id,
                    name: x.applicationName,
                    metadata: x,
                    registered: false,
                    port: undefined
                };
            });
    }

    register(origin: string, port: MessagePort) {
        const client = this.clients.find(x => x.metadata.sourceUrl === origin);
        client.registered = true;
        client.port = port;
        return client.id;
    }

    getInterestedClients(event: string) {
        return this.clients.filter(client => 
            client.metadata.eventsOfInterest.filter(x => x.name === event).length > 0
        );
    }

    private clients: IClient[] = [];
}

declare type Dispatcher = (clientId: string, event: any, data: any, clientManager: ClientStateManager) => void;

class Bootstrap {
    constructor(private clientManager: ClientStateManager) { }

    async init() {
        console.log("init");
        const dispatcher = this.createEventDispatcher();
        this.createEventListener(dispatcher);
        this.createClientRenderer();
        await this.fetchClients();
    }

    private createEventListener(dispatcher: Dispatcher) {
        window.addEventListener("message", (message: MessageEvent) => {
            const event = message.data as IEvent;
            
            if (event.name === "client-connector:client:loaded") {
                const clientId = this.clientManager.register(event.data.origin, message.ports[0]);
                
                message.ports[0].onmessage = (e: MessageEvent) => {
                    console.log(e);
                    dispatcher(clientId, e.data.name, e.data.data, this.clientManager);
                };

                return;
            }
        });
    }

    private createEventDispatcher() {
        return (clientId: string, event: any, data: any, clientManager: ClientStateManager) => {
            clientManager
                .getInterestedClients(event)
                .map(client => {
                    if(client.id === clientId){
                        return;
                    }
                    console.log("dispatching to:", client.name);
                    client.port.postMessage({
                        name: event,
                        version: "0.0.1",
                        data: data
                    });
                });
        };
    }

    private createClientRenderer() {
        window.addEventListener("DOMContentLoaded", () => {
            const el = document.querySelector("#the-dreamweaver");

            if (!el) {
                console.error("no dreamweaver");
                return;
            }

            const clients = this.clientManager.get().map(x => x.metadata);

            clients.map(x => {
                const frame = document.createElement("iframe");
                frame.setAttribute("id", `dw-client-${x.id}`); // assign an id
                frame.setAttribute("frameborder", "0");
                frame.setAttribute("src", x.sourceUrl);
                el.appendChild(frame);
            });
        }, false);
    }

    private async fetchClients() {
        this.clientManager.set(await Catalogue.GetClients());
    }
}

// tslint:disable-next-line:only-arrow-functions
(function () {
    new Bootstrap(new ClientStateManager())
        .init()
        .then(() => console.info("Bootstrap complete."));
})();