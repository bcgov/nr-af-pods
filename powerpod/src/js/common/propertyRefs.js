export const PropertyReferences = {
  quartech_projectlocation: 'quartech_ProjectLocation@odata.bind',
  quartech_naicsindustry: 'quartech_NAICSIndustry@odata.bind',
  quartech_commodity: 'quartech_Commodity@odata.bind',
};

export const PropertyReferenceValues = {
  quartech_projectlocation: (value) => `/quartech_municipals(${value})`,
  quartech_naicsindustry: (value) => `/quartech_naicscodes(${value})`,
  quartech_commodity: (value) => `/quartech_commodities(${value})`,
};
