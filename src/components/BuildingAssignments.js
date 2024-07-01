import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import Modal from './Modal';

function BuildingAssignments({ buildings, ras, assignedRAs, setAssignedRAs }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [editRAIndex, setEditRAIndex] = useState(null);
  const [showAssignedRAs, setShowAssignedRAs] = useState({});

  // Open modal for assigning or editing RAs
  const handleOpenModal = (building, raIndex = null) => {
    setSelectedBuilding(building);
    setEditRAIndex(raIndex);
    setIsModalOpen(true);
  };

  // Handle the saving of a new or edited RA assignment
  const handleAssignRA = (inputs) => {
    const { 'RA Name': raName } = inputs;
    if (!raName) return;

    const [name, score] = raName.split(' - Score: ');

    // Check if the RA is already assigned to another building
    const isAlreadyAssigned = Object.values(assignedRAs).some(assignments =>
      assignments.some(ra => ra.name === name)
    );

    const assignedRAList = assignedRAs[selectedBuilding.name] || [];

    // If editing an existing RA, replace it with the new details
    if (editRAIndex !== null) {
      if (isAlreadyAssigned && assignedRAList[editRAIndex].name !== name) {
        alert(`RA "${name}" is already assigned to another building.`);
        return;
      }
      assignedRAList[editRAIndex] = { name, score };
    } else {
      // If adding a new RA, ensure it's not already assigned and the limit isn't exceeded
      if (isAlreadyAssigned) {
        alert(`RA "${name}" is already assigned to another building.`);
        return;
      }
      if (assignedRAList.length >= selectedBuilding.numberOfRAs) {
        alert(`Cannot assign more than ${selectedBuilding.numberOfRAs} RAs to ${selectedBuilding.name}.`);
        return;
      }
      assignedRAList.push({ name, score });
    }

    setAssignedRAs((prevAssignedRAs) => ({
      ...prevAssignedRAs,
      [selectedBuilding.name]: assignedRAList,
    }));

    setIsModalOpen(false);
  };

  // Handle the deletion of an RA from a building's assignment list
  const handleDeleteRA = (buildingName, index) => {
    const updatedAssignedRAs = { ...assignedRAs };
    updatedAssignedRAs[buildingName] = assignedRAs[buildingName].filter((_, i) => i !== index);
    setAssignedRAs(updatedAssignedRAs);
  };

  // Toggle the display of assigned RAs for a building
  const toggleShowAssignedRAs = (buildingName) => {
    setShowAssignedRAs((prevShowAssignedRAs) => ({
      ...prevShowAssignedRAs,
      [buildingName]: !prevShowAssignedRAs[buildingName],
    }));
  };

  // Generate a PDF of the building assignments
  const generatePDF = () => {
    try {
      const pdf = new jsPDF();
      let yOffset = 10;
      const lineHeight = 10;

      buildings.forEach((building, index) => {
        const assignedRAList = assignedRAs[building.name] || [];
        const assignedCount = assignedRAList.length;
        const totalRAs = building.numberOfRAs;

        // Building name and area
        pdf.text(`${index + 1}. ${building.name} - Area: ${building.area}`, 10, yOffset);
        yOffset += lineHeight;

        // RA count information
        pdf.text(`${assignedCount}/${totalRAs} RAs Assigned`, 10, yOffset);
        yOffset += lineHeight;

        // Assigned RAs
        assignedRAList.forEach((ra) => {
          const raText = `${ra.name} ${ra.score ? `- Score: ${ra.score}` : ''}`;
          yOffset += lineHeight;

          // Using bullet points for each RA
          pdf.text(`\u2022 ${raText}`, 20, yOffset);
        });

        // Draw line separator
        yOffset += lineHeight / 2;
        pdf.line(10, yOffset, 200, yOffset);
        yOffset += lineHeight / 2;
      });

      pdf.save('building-assignment.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="section">
      <div className="header">
        <button className="download-button" onClick={generatePDF}>Download PDF</button>
      </div>
      <div id="building-assignment-content">
        <h2>Building Assignment</h2>
        {buildings.map((building, index) => {
          const assignedRAList = assignedRAs[building.name] || [];
          const assignedCount = assignedRAList.length;
          const totalRAs = building.numberOfRAs;

          return (
            <div key={index} className="building-wrapper">
              <div className="building">
                <h3>{index + 1}. {building.name} - Area: {building.area}</h3>
                <div className="ra-info">
                  <span className="ra-counter">{assignedCount}/{totalRAs} RAs Assigned</span>
                  <button className="view-ra-button" onClick={() => toggleShowAssignedRAs(building.name)}>
                    {showAssignedRAs[building.name] ? 'Hide RAs' : 'View RAs'}
                  </button>
                </div>
                {showAssignedRAs[building.name] && (
                  <ul className="assigned-ras">
                    {assignedRAList.map((ra, raIndex) => (
                      <li key={raIndex}>
                        {ra.name} {ra.score ? `- Score: ${ra.score}` : ''}
                        <div className="ra-actions">
                          <button onClick={() => handleOpenModal(building, raIndex)}>Replace</button>
                          <button className="delete-button" onClick={() => handleDeleteRA(building.name, raIndex)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <button onClick={() => handleOpenModal(building)}>Add RA</button>
              </div>
            </div>
          );
        })}
        {isModalOpen && selectedBuilding && (
          <Modal
            onClose={() => setIsModalOpen(false)}
            onSave={handleAssignRA}
            fields={['RA Name']}
            dropdownOptions={ras
              .filter(ra => !Object.values(assignedRAs).some(assignments => assignments.some(assigned => assigned.name === ra.name)))
              .map(ra => `${ra.name}${ra.score !== undefined ? ' - Score: ' + ra.score : ''}`)}
            dropdownLabel="RA Name"
            initialData={editRAIndex !== null ? {
              'RA Name': `${assignedRAs[selectedBuilding.name][editRAIndex].name}${assignedRAs[selectedBuilding.name][editRAIndex].score ? ' - Score: ' + assignedRAs[selectedBuilding.name][editRAIndex].score : ''}`
            } : {}}
          />
        )}
      </div>
    </div>
  );
}

export default BuildingAssignments;
