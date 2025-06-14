import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import '../css/Map.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhc3VuYSIsImEiOiJjbWJheDkzankxYmNvMnFva24wbDdydzdmIn0.moK-KHgAgxougSg_m-QzSQ';

function Map(){
  const mapContainer = useRef(null);//connect to DOM
  const map = useRef(null); //the map
  const [zipCode, setZipCode] = useState('');

  //initialize
  useEffect(() =>{
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-74.006, 40.7128], // NYC coords
      zoom: 10,
     });

        
     map.current.on('load',()=>{
        //loads zip shapes
      map.current.addSource('nyc-zips',{
        type:'geojson',
        data:'/data/modzcta.geojson',
        generateId:true //for hovering to work
      });

    //interactive hovering and clicking
      map.current.addLayer({
        id:'zip-interactive',
        type:'fill',
        source:'nyc-zips',
        paint:{
          'fill-color': 'transparent'
        }
      });
      
      // visible outline layer only on hover
      map.current.addLayer({
        id: 'zip-outline',
        type: 'line',
        source: 'nyc-zips',
        paint: {
          'line-color':[
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#000000',
            'transparent'
          ],
          'line-width':[
            'case',
            ['boolean',['feature-state', 'hover'], false],
            2,
            0
          ]
        }
      });

    
      let hoveredId = null;

    //tracks where it is hovering
      map.current.on('mousemove', 'zip-interactive', (e) =>{
        if (e.features.length > 0){
          if (hoveredId !== null){
            //creates outline
            map.current.setFeatureState(
              { source: 'nyc-zips', id: hoveredId},
              { hover: false}
            );
          }

          hoveredId = e.features[0].id;

          map.current.setFeatureState(
            { source: 'nyc-zips', id: hoveredId},
            { hover: true}
          );
    
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });


    //mouse leaves, no outline and remove popup
      map.current.on('mouseleave', 'zip-interactive', () =>{
        if (hoveredId !== null){
          map.current.setFeatureState(
            { source: 'nyc-zips', id: hoveredId},
            { hover: false}
          );
        }
        hoveredId = null;
        map.current.getCanvas().style.cursor = '';

        if(popup){
            popup.remove();
            popup=null;
        }
      });

      let popup = null;
      //popup text on click, closes popup
      map.current.on('click', 'zip-interactive', (e) => {
        const props = e.features[0].properties;
        const zip = props.modzcta;

        if(popup) popup.remove();
      
        popup = new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="max-width: 250px;">
              <strong>ZIP Code: ${zip}</strong><br/>
              <em>AI-generated summary</em><br/><br/>
              
            </div>
          `)
          .addTo(map.current);
      });
      

    });
  },[]);

  return (
    <div className="map-container">
          <div className="sidebar">
            <h1 className="title">Community Block</h1>
            <label htmlFor="zip-search">search by zip code</label>
            <input id="zip-search" type="text" placeholder="e.g. 10010" />
            <div className="issues">
              <h2>Top Issues</h2>
              <p>Summary of complaints</p>
            </div>
          </div>

        <div className="map-area" ref={mapContainer} />
    </div>
  );
}

export default Map
