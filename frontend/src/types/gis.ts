export interface GeoJSONFeatureCollection {

  type: "FeatureCollection";

  features: GeoJSONFeature[];

}


export interface GeoJSONFeature {

  type: "Feature";


  geometry: {

    type: "Point";

    coordinates: [
      number,
      number
    ];

  };


  properties: {

    id: number;

    district?: string;

    severity?: string;

    year?: number;

  };

}



export interface NearbyAccident {

  id: number;

  latitude: number;

  longitude: number;

  distance_meters: number;

  district?: string;

  severity?: string;

}



export interface Hotspot {

  latitude: number;

  longitude: number;

  accident_count: number;

}