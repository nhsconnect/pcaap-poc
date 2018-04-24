import { Logger } from "../utilities/logger";
const logger = Logger.getLogger("event-aggregator");

interface IHandler {
    handle: (data: any) => void
}

interface IEventHandlerIndexer {
    [event: string]: EventHandler[];
}

interface IEAObject {
    publish: (event: string | any, data?: any) => void;
    subscribe: (event: string | Function, callback: (data: any) => void) => void;
    subscribeOnce: (event: string | Function, callback: (data: any) => void) => void;
}

class ChannelHandler implements IHandler {
    constructor(
        private event: Function,
        private callback: (data: any) => void
    ) { }

    handle(data: any): void {
        if (data instanceof this.event) {
            this.callback.call(null, data);
        }
    }
}

class EventHandler implements IHandler {
    constructor(
        private callback: (data: any) => void
    ) { }

    handle(data: any): void {
        this.callback(data);
    }
}

export interface IEvent {
    name: string;
    version: string;
    data: any;
}

export const DomEvents = {
    DOMContentLoaded: "DOMContentLoaded",
    Message: "message"
}

/**
* Represents a disposable subsciption to an EventAggregator event.
*/
export interface ISubscription {
    /**
    * Disposes the subscription.
    */
    dispose(): void;
}

/**
* Enables loosely coupled publish/subscribe messaging.
*/
export class EventAggregator {
    /**
    * Creates an instance of the EventAggregator class.
    */
    constructor() { }

    private eventHandlerLookup: IEventHandlerIndexer = {};
    private channelHandlers: ChannelHandler[] = [];

    /**
    * Publishes a message.
    * @param event The event or channel to publish to.
    * @param data The data to publish on the channel.
    */
    publish(event: string | Function, data?: any): void {
        if (!event) {
            throw new Error("Event was invalid.");
        }

        typeof event === "string"
            ? this.handleEventSubsciptions(event, data)
            : this.handleChannelSubscriptions();
    }

    private handleEventSubsciptions(event: string, data: any) {
        let subscribers = this.eventHandlerLookup[event];
        if (subscribers) {
            subscribers = subscribers.slice();
            let i = subscribers.length;

            while (i--) {
                this.invokeHandler(subscribers[i], data);
            }
        }
    }

    private handleChannelSubscriptions() {
        const subscribers = this.channelHandlers.slice();
        let i = subscribers.length;

        while (i--) {
            this.invokeHandler(subscribers[i], event);
        }
    }

    private invokeHandler(handler: ChannelHandler | EventHandler, data: any): void {
        try {
            handler.handle(data);
        } catch (e) {
            logger.error(e);
        }
    }

    /**
    * Subscribes to a message channel or message type.
    * @param event The event channel or event data type.
    * @param callback The callback to be invoked when when the specified message is published.
    */
    subscribe(event: string | Function, callback: (data: any) => void): ISubscription {
        let handler: IHandler;
        let subscribers: IHandler[];

        if (!event) {
            throw new Error('Event channel/type was invalid.');
        }

        if (typeof event === 'string') {
            handler = new EventHandler(callback);
            subscribers = this.eventHandlerLookup[event] || (this.eventHandlerLookup[event] = []);
        } else {
            handler = new ChannelHandler(event, callback);
            subscribers = this.channelHandlers;
        }

        subscribers.push(handler);

        return {
            dispose() {
                let idx = subscribers.indexOf(handler);
                if (idx !== -1) {
                    subscribers.splice(idx, 1);
                }
            }
        };
    }

    /**
    * Subscribes to a message channel or message type, then disposes the subscription automatically after the first message is received.
    * @param event The event channel or event data type.
    * @param callback The callback to be invoked when when the specified message is published.
    */
    subscribeOnce(event: string | Function, callback: (data: any) => void): ISubscription {
        let sub = this.subscribe(event, (d: any) => {
            sub.dispose();
            return callback(d);
        });

        return sub;
    }
}

/**
* Includes EA functionality into an object instance.
* @param obj The object to mix Event Aggregator functionality into.
*/
export function includeEventsIn(obj: object): EventAggregator {
    let ea = new EventAggregator();

    const eaObject = obj as IEAObject;

    eaObject.subscribeOnce = function (event, callback) {
        return ea.subscribeOnce(event, callback);
    };

    eaObject.subscribe = function (event, callback) {
        return ea.subscribe(event, callback);
    };

    eaObject.publish = function (event, data) {
        ea.publish(event, data);
    };

    return ea;
}