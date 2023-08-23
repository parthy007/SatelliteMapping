import "./Map.css"
import { FeatureGroup, MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {EditControl} from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { useState } from "react";
import dummyData from "../../dummyData.json";
import * as turf from '@turf/turf';


export const Map = () => {

    const [displayContent, setDisplayContent] = useState('coordinates');
    const [coordinates, setCoordinates] = useState([]);
    const [renderKey, setRenderKey] = useState(0);
    const [intersectingTiles, setIntersectingTiles] = useState([]);

    const findTileWithIntersection = (tileGeometry, drawnGeometry) => {
        const tilePolygon = turf.polygon(tileGeometry.coordinates);
        const intersects = turf.booleanIntersects(tilePolygon, drawnGeometry);
        const tileWithinAOI = turf.booleanWithin(drawnGeometry, tilePolygon);
        return intersects && tileWithinAOI;
    };


    const handleSidebar = (content) => {
        setDisplayContent(content);
    };

    const handleCreate = (e) => {
        const {layer} = e;
        const drawnAOI = layer.toGeoJSON();

        setCoordinates((layers)=>[...layers,{id:layer._leaflet_id, data:drawnAOI}]);

        const tileWithIntersection = dummyData.features.find((tile) =>
            findTileWithIntersection(tile.geometry, drawnAOI)
        );
        if (tileWithIntersection) {
            setIntersectingTiles((prevTiles) => [...prevTiles, { id: layer._leaflet_id, data: tileWithIntersection }]);
        }
    };

    const handleEdit = (e) => {
        const { layers: { _layers } } = e;
        const editedLayerId = Object.values(_layers)[0]._leaflet_id;
        const newDrawnAOI = Object.values(_layers)[0].toGeoJSON();
        const tileWithIntersection = dummyData.features.find((tile) =>
            findTileWithIntersection(tile.geometry, newDrawnAOI)
        );
        setIntersectingTiles((prevArray)=>{
            return prevArray.map((obj)=>{
                if(obj.id === editedLayerId){
                    return {...obj, data: tileWithIntersection}
                }
                return obj;
            });
        });
        setCoordinates((layers)=>{
            return layers.map((layer)=>{
                if(layer.id === editedLayerId){
                    return {...layer,data: newDrawnAOI}
                }
                return layer
            })
        })
        setRenderKey((prevKey) => prevKey + 1);
    }

    const handleDelete = (e) =>{
        const {layers: {_layers}} = e
        const deletedLayerIds = Object.values(_layers).map(layer => layer._leaflet_id);
        setIntersectingTiles((prevTiles) => {
            return prevTiles.filter(tile => !deletedLayerIds.includes(tile.id));
        });
        setCoordinates((layers)=>{
            return layers.filter(l => !deletedLayerIds.includes(l.id));
        })
    }

  return (
    <div className="infoContainer">
        <div className='map'>
        <MapContainer center={[12.9716, 77.5946]} zoom={8} scrollWheelZoom={true}>
            <FeatureGroup>
                <EditControl 
                    position="topright" 
                    onCreated={handleCreate} 
                    onEdited={handleEdit} 
                    onDeleted={handleDelete} 
                    draw={{
                        polyline:false, 
                        polygon:false, 
                        circle: false, 
                        circlemarker:false, 
                        marker:false
                    }}
                />
            </FeatureGroup>

            {intersectingTiles.map((tile) => (
                <GeoJSON
                    key={`${tile.id}-${renderKey}`}
                    data={tile.data}
                    style={() => ({
                        fillColor: "red",
                        fillOpacity: 0.5,
                    })}
                />
                ))  
            }

            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        </MapContainer>
        </div>

        <div className="sidebar">
            <div className="sideBarTop">
                <button className="sidebarButton" onClick={()=>handleSidebar('coordinates')}>Coordinates</button>
                <button className="sidebarButton" onClick={()=>handleSidebar('help')}>Help</button>
            </div>
            <div className="sidebarDisplay">
                {displayContent === 'coordinates' && (<div className="sidebarWrapper">
                    <h3 className="sidebarTitle">
                        Get Coordinates Below
                    </h3>
                    <p className="sidebarTitle">Use the tools on the topright corner</p>
                    <div className="drawnCoordinates">
                        {coordinates.map((coord,index)=>(
                            <div key={index} className="coordinateItem">
                                <p className="coordinateTitle">Drawn AOI ID: {coord.id}</p>
                                <p className="coordinateText">
                                Coordinates:
                                <br />
                                <div className="coordinateArray">
                                    {coord.data.geometry.coordinates.map((coords, i) => (
                                        <div key={i} className="coordinateRow">
                                            <span className="indentation"></span>
                                            <span className="coordinateValues">
                                                [{coords.join(', ')}]
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="intersectingCoordinates">
                        {intersectingTiles.map((tile) => (
                            <div key={tile.id} className="coordinateItem">
                            <p className="coordinateTitle">Intersecting AOI ID: {tile.id}</p>
                            <p className="coordinateText">
                            Coordinates:
                            <br />
                            <div className="coordinateArray">
                                {tile.data.geometry.coordinates.map((coords, i) => (
                                    <div key={i} className="coordinateRow">
                                        <span className="indentation"></span>
                                        <span className="coordinateValues">
                                            [{coords.join(', ')}]
                                        </span>
                                    </div>
                                ))}
                            </div>
                            </p>
                            </div>
                        ))}
                    </div>
                </div>)}
                {displayContent === 'help' && (<div className="sidebarHelp">
                    <h3 className="helpHeading">Help</h3>
                    <p className="helpParagraph">
                        This console serves as a valuable resource for locating and visualizing tiles that intersect with your <b>Area of Interest (AOI)</b>. These specific tiles are established based on metadata from satellite images.
                    </p>

                    <h3 className="helpHeading">Want to Draw?</h3>
                    <p className="helpParagraph">
                        To create a new Area of Interest (AOI), you can utilize the drawing rectangle tool located in the top right corner of the map interface. Simply click on the tool, select your desired starting point, and then drag your cursor to draw the rectangle. As you draw, the coordinates of your AOI will be recorded. Moreover, you will receive information about the tile that fully intersects with the drawn AOI. This allows you to precisely define your AOI and understand which tile it aligns with on the map.
                    </p>

                    <h3 className="helpHeading">Want to Edit?</h3>
                    <p className="helpParagraph">
                        To make edits, utilize the editing tool located as the second option in the top right corner of the map interface. Click on this tool and select the specific layer you wish to edit. After making your desired changes, remember to click the "save" option. This action will provide you with updated coordinates for the modified Area of Interest (AOI) and information regarding the tile that intersects with the adjusted AOI region.
                    </p>

                    <h3 className="helpHeading">Want to Delete?</h3>
                    <p className="helpParagraph">
                        For removing all layers, employ the delete tool located as the third option in the top right corner of the map interface. Simply click on this tool and select "clear all" to eliminate all layers along with their associated coordinates.
                    </p>
                </div>)}
            </div>
        </div>
    </div>

  )
}
