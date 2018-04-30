export namespace Catalogue {

    export interface IClientMetadata {
        id: string;
        applicationName: string;
        publisher: string;
        sourceUrl: string;
        eventsOfInterest: IEventMetadata[];
    }

    export interface IEventMetadata {
        name: string;
    }

    export async function GetClients(): Promise<IClientMetadata[]> {
        const clients: IClientMetadata[] = [
            {
                id: "168be560-ab86-4020-a41e-a30e51dbbab8",
                applicationName: "CoreGP",
                publisher: "CoreGpSys",
                sourceUrl: "http://localhost:3101",
                eventsOfInterest: [
                    { name: "test-message" },
                    { name: "patient-context:started" },
                    { name: "patient-context:changed" },
                    { name: "patient-context:ended" }
                ]
            },
            {
                id:"34480cf8-7ada-4f81-9fd5-643b6fe269d0",
                applicationName: "AnotherModule",
                publisher: "GpSystems",
                sourceUrl: "http://localhost:3102",
                eventsOfInterest: [
                    { name: "test-message" },
                    { name: "patient-context:started" },
                    { name: "patient-context:changed" },
                    { name: "patient-context:ended" }
                ]
            }
        ];

        return clients;
    }
}