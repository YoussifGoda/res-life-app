import React, { useState } from 'react';
import RAList from './components/RAList';
import BuildingList from './components/BuildingList';
import BuildingAssignments from './components/BuildingAssignments';

function App() {
  const [ras, setRAs] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [assignedRAs, setAssignedRAs] = useState({});

  const addRA = (ra) => {
    setRAs([...ras, ra]);
  };

  const deleteRA = (index) => {
    const updatedRAs = ras.filter((_, i) => i !== index);
    setRAs(updatedRAs);

    // Remove deleted RA from assignedRAs
    const updatedAssignedRAs = { ...assignedRAs };
    for (let buildingName in updatedAssignedRAs) {
      updatedAssignedRAs[buildingName] = updatedAssignedRAs[buildingName].filter(ra => ra.name !== ras[index].name);
    }
    setAssignedRAs(updatedAssignedRAs);
  };

  const updateRA = (index, updatedRA, deleteFlag = false) => {
    // Update assignedRAs with edited or deleted RA
    const updatedAssignedRAs = { ...assignedRAs };
    for (let buildingName in updatedAssignedRAs) {
      if (deleteFlag) {
        updatedAssignedRAs[buildingName] = updatedAssignedRAs[buildingName].filter(ra => ra.name !== ras[index].name);
      } else {
        updatedAssignedRAs[buildingName] = updatedAssignedRAs[buildingName].map(ra => ra.name === ras[index].name ? updatedRA : ra);
      }
    }
    setAssignedRAs(updatedAssignedRAs);
  };

  const addBuilding = (building) => {
    setBuildings([...buildings, building]);
  };

  const updateBuilding = (index, updatedBuilding) => {
    setBuildings((prevBuildings) => {
      const updatedBuildings = [...prevBuildings];
      updatedBuildings[index] = updatedBuilding;
      return updatedBuildings;
    });
  };

  const deleteBuilding = (index) => {
    setBuildings((prevBuildings) => prevBuildings.filter((_, i) => i !== index));
    setAssignedRAs((prevAssignedRAs) => {
      const newAssignedRAs = { ...prevAssignedRAs };
      delete newAssignedRAs[buildings[index].name];
      return newAssignedRAs;
    });
  };

  return (
    <div className="app">
      <div className="heading-wrapper">
        <h1>RA and Building Management</h1>
      </div>
      <div className="sections">
        <RAList ras={ras} addRA={addRA} deleteRA={deleteRA} updateRA={updateRA} />
        <BuildingList
          buildings={buildings}
          addBuilding={addBuilding}
          updateBuilding={updateBuilding}
          deleteBuilding={deleteBuilding}
        />
        <BuildingAssignments
          ras={ras}
          buildings={buildings}
          assignedRAs={assignedRAs}
          setAssignedRAs={setAssignedRAs}
          updateRA={updateRA}
        />
      </div>
    </div>
  );
}

export default App;