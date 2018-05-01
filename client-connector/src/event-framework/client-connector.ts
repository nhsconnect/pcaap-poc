import { EventAggregator, ISubscription, IEvent, DomEvents } from "./event-aggregator";

export namespace DwClientConnector {
    /**
     * Initialises the client connector.
     * @param origin The base URL for the client application.
     * @param host The base URL for the host application.
     */
    export function init(origin: string, host: string): void {
        if (client) {
            throw new Error("Cannot initialise a new instance of the client connector as one already exists.");
        }

        if (!ea) {
            ea = new EventAggregator();
        }

        client = new Connector(origin, host, ea);
    }

    /**
     * Publishes an event.
     * @param event Event object.
     */
    export function publish(event: IEvent): void {
        client.publish(event);
    }

    /**
     * Subscribe to an event.
     * @param eventName Name of the event you want to subscribe to.
     * @param callback Callback for when the event is raised.
     */
    export function subscribe(eventName: string, callback: (data: any) => void): ISubscription {
        return ea.subscribe(eventName, callback);
    }

    /**
     * Subscribe to an event once.
     * @param eventName Name of the event you want to subscribe to.
     * @param callback Callback for when the event is raised.
     */
    export function subscribeOnce(eventName: string, callback: (data: any) => void): ISubscription {
        return ea.subscribeOnce(eventName, callback);
    }

    let client: Connector;
    let ea: EventAggregator;

    class Connector {
        constructor(
            private origin: string, 
            private host: string, 
            private events: EventAggregator
        ) {
            window.addEventListener(
                DomEvents.DOMContentLoaded, 
                this.loadHandler.bind(this), 
                false
            );
        }

        private channel: MessageChannel;

        publish(event: IEvent): void {
            if(!this.channel){
                throw new Error("Unable to publish message. There is no open channel.");
            }

            // port 2 is sent to the parent, so we (the client) send messages on port 1
            this.channel.port1.postMessage(event);
        }

        private loadHandler() {
            // Create the message channel
            this.channel = new MessageChannel();

            // TODO: Event factory?
            // Create the message
            const message: IEvent = {
                name: "client-connector:client:loaded",
                version: "0.0.1",
                data: {
                    origin: this.origin
                }
            };

            // Send a port to the parent document
            window.parent.postMessage(message, this.host, [this.channel.port2]);

            // Set up the port event listener
            this.channel.port1.onmessage = (message: MessageEvent) => 
                this.events.publish(message.data.name, message.data.data);

            // Open the port
            this.channel.port1.start();
        }
    }
}
