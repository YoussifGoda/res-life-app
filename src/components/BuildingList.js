import React, { useState } from 'react';
import Modal from './Modal';

function BuildingList({ buildings, addBuilding, updateBuilding, deleteBuilding }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [currentBuildingIndex, setCurrentBuildingIndex] = useState(null);
  const [modalInputs, setModalInputs] = useState({}); // State to hold modal inputs

  // Function to handle opening the modal for adding or editing a building
  const handleOpenModal = (type, index = null) => {
    if (type === 'edit' && index !== null) {
      setCurrentBuildingIndex(index);
      setModalInputs({
        'Building Name': buildings[index].name,
        'Area (optional)': buildings[index].area || '',
        'Number of RAs': buildings[index].numberOfRAs.toString(),
      });
    } else {
      setModalInputs({});
    }
    setModalType(type);
    setIsModalOpen(true);
  };

  // Function to handle saving the building after editing or adding
  const handleSaveBuilding = (inputs) => {
    const { 'Building Name': name, 'Area (optional)': area, 'Number of RAs': numberOfRAs } = inputs;

    if (isNaN(Number(numberOfRAs))) {
      alert('Number of RAs must be a valid number.');
      return;
    }

    const newBuilding = { name, area, numberOfRAs: Number(numberOfRAs) };

    if (modalType === 'add') {
      addBuilding(newBuilding);
    } else if (modalType === 'edit' && currentBuildingIndex !== null) {
      updateBuilding(currentBuildingIndex, newBuilding);
    }

    setIsModalOpen(false);
    setCurrentBuildingIndex(null);
    setModalInputs({});
  };

  return (
    <div className="section">
      <h2>Building List</h2>
      <button onClick={() => handleOpenModal('add')}>Add Building</button>
      {isModalOpen && (
        <Modal
          onClose={() => {
            setIsModalOpen(false);
            setCurrentBuildingIndex(null);
            setModalInputs({});
          }}
          onSave={handleSaveBuilding}
          fields={['Building Name', 'Area (optional)', 'Number of RAs']}
          initialValues={modalInputs}
        />
      )}
      <ul>
        {buildings.map((building, index) => (
          <li key={index} className="building-item">
            <div className="building-info">
              <span>{index + 1}. {building.name} {building.area ? `- Area: ${building.area}` : ''}</span>
              <div className="building-actions">
                <button onClick={() => handleOpenModal('edit', index)}>Edit</button>
                <button className='delete-button' onClick={() => deleteBuilding(index)}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BuildingList;