## dw-client-connector

### Usage

```javascript
// initialise the client connector
DwClientConnector.init("origin-url", "host-url");

// subscribe to events
DwClientConnector.subscribe("message-name", (data) => {
    // callback
});

DwClientConnector.subscribeOnce("another-message-name", (data) => {
    // callback
});
```