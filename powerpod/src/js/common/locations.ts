import { POWERPOD } from './constants.js';

POWERPOD.locations = {
  processLocationData,
};

type DataBlob = {
  value: Array<MunicipalBlob>;
};

type MunicipalBlob = {
  quartech_name: string;
  quartech_RegionalDistrict: {
    quartech_name: string;
  };
};

export type Municipals = {
  [key: string]: Locations;
};

type Locations = string[];

export function processLocationData(json: DataBlob) {
  const dataArray = json?.value;

  const res = dataArray.reduce((acc: Municipals, municipal: MunicipalBlob) => {
    const { quartech_name: municipalName, quartech_RegionalDistrict } =
      municipal;
    const { quartech_name: regionalDistrictName } =
      quartech_RegionalDistrict ?? { quartech_name: 'Other' };

    if (!acc[regionalDistrictName]) {
      acc[regionalDistrictName] = [municipalName];
    } else {
      acc[regionalDistrictName].push(municipalName);
    }

    return acc;
  }, {});

  return res;
}
