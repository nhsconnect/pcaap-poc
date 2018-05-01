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
        return client;
    }

    getInterestedClients(event: string) {
        return this.clients.filter(client => 
            client.metadata.eventsOfInterest.filter(x => x === event).length > 0
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
                const client = this.clientManager.register(event.data.origin, message.ports[0]);
                const clientId = client.id;
                
                message.ports[0].onmessage = (e: MessageEvent) => {
                    if (client.metadata.eventsOfInterest.indexOf(e.data.name) !== -1) {
                        dispatcher(clientId, e.data.name, e.data.data, this.clientManager);
                    }
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
            const frames = document.querySelector("#the-dreamweaver");
            const sidebar = document.querySelector("#the-sidebar");

            if (!frames) {
                console.error("no dreamweaver");
                return;
            }

            const clients = this.clientManager.get().map(x => x.metadata);

            clients.forEach((x, index: number) => {
                const frame = this.createClientFrame(index, x.id, x.sourceUrl);
                const icon = this.createClientIcon(index, x.id, x.applicationName);

                icon.addEventListener("click", this.selectModule);

                frames.appendChild(frame);
                sidebar.appendChild(icon);
            });
        }, false);
    }

    private createClientFrame(index: number, clientId: string, sourceUrl: string): HTMLIFrameElement {
        const frame = document.createElement("iframe");
        frame.setAttribute("id", `dw-client-${clientId}`);
        frame.setAttribute("frameborder", "0");
        frame.setAttribute("src", sourceUrl);
        frame.classList.add("frames");
        
        if (index > 0) {
            frame.classList.add("dw-hide");
        }

        return frame;
    }

    private createClientIcon(index: number, clientId: string, applicationName: string): HTMLAnchorElement {
        const icon = document.createElement("a");
        icon.setAttribute("data-target", `dw-client-${clientId}`);
        icon.innerText = applicationName;
        icon.classList.add("sidebar-icons", "button", "is-rounded");

        if (index === 0) {
            icon.classList.add("is-info", "is-active");
        }

        return icon;
    }

    private selectModule(event: MouseEvent) {
        event.preventDefault();

        const target: HTMLElement = <HTMLElement>(event.target);
        const targetId = target.dataset["target"];

        const frames = Array.prototype.slice.call(document.querySelectorAll(".frames"));
        const icons = Array.prototype.slice.call(document.querySelectorAll(".sidebar-icons"));

        frames.forEach((el: HTMLElement) => {
            el.classList.add("dw-hide");
        });

        icons.forEach((el: HTMLElement) => {
            el.classList.remove("is-active", "is-info");
        });

        const visibleFrame = document.getElementById(targetId);
        visibleFrame.classList.remove("dw-hide");
        target.classList.add("is-active", "is-info");
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