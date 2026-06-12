import { useState } from "react";


interface NearbySearchProps {

    onSearch : (
        latitude:number,
        longitude:number,
        radius:number
    ) => void;

}


const NearbySearch = ({onSearch}:NearbySearchProps)=>{


    const [latitude,setLatitude] = useState("");
    const [longitude,setLongitude] = useState("");
    const [radius,setRadius] = useState("5");



    const handleSearch = ()=>{


        if(!latitude || !longitude)
            return;


        onSearch(
            Number(latitude),
            Number(longitude),
            Number(radius)
        );

    };



    return (


        <div className="
            bg-white 
            rounded-xl 
            shadow 
            p-4 
            space-y-3
        ">


            <h3 className="font-semibold">
                Nearby Accident Search
            </h3>



            <input
                className="border p-2 w-full rounded"
                placeholder="Latitude"
                value={latitude}
                onChange={(e)=>setLatitude(e.target.value)}
            />


            <input
                className="border p-2 w-full rounded"
                placeholder="Longitude"
                value={longitude}
                onChange={(e)=>setLongitude(e.target.value)}
            />



            <input
                className="border p-2 w-full rounded"
                placeholder="Radius KM"
                value={radius}
                onChange={(e)=>setRadius(e.target.value)}
            />



            <button

                onClick={handleSearch}

                className="
                    bg-blue-600 
                    text-white 
                    px-4 
                    py-2 
                    rounded
                    w-full
                "
            >

                Search

            </button>


        </div>

    );


};


export default NearbySearch;