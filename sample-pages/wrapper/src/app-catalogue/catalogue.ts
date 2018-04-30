export namespace Catalogue {

    export interface IClientMetadata {
        id: string;
        applicationName: string;
        publisher: string;
        sourceUrl: string;
        eventsOfInterest: string[];
    }

    export async function GetClients(): Promise<IClientMetadata[]> {
        const clients: IClientMetadata[] = [
            {
                id: "168be560-ab86-4020-a41e-a30e51dbbab8",
                applicationName: "Core",
                publisher: "CoreGpSys",
                sourceUrl: "http://localhost:3101",
                eventsOfInterest: [
                    "test-message",
                    "patient-context:started",
                    "patient-context:changed",
                    "patient-context:ended"
                ]
            },
            {
                id:"34480cf8-7ada-4f81-9fd5-643b6fe269d0",
                applicationName: "INR",
                publisher: "GpSystems",
                sourceUrl: "http://localhost:3102",
                eventsOfInterest: [
                    "test-message",
                    "patient-context:started",
                    "patient-context:changed",
                    "patient-context:ended"
                ]
            }
        ];

        return clients;
    }
}