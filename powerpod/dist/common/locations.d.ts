interface DataBlob {
    value: Array<MunicipalBlob>;
}
type MunicipalBlob = {
    quartech_name: string;
    quartech_RegionalDistrict: {
        quartech_name: string;
    };
};
export interface Municipals {
    [key: string]: Locations;
}
type Locations = string[];
export declare function processLocationData(json: DataBlob): Municipals;
export {};
