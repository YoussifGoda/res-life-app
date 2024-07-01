import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import Modal from './Modal';

function BuildingAssignments({ buildings, ras, assignedRAs, setAssignedRAs, updateRA }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [editRAIndex, setEditRAIndex] = useState(null);
  const [showAssignedRAs, setShowAssignedRAs] = useState({});
  
  // Effect to reset assigned RAs when selectedBuilding changes
  useEffect(() => {
    if (selectedBuilding) {
      const resetAssignedRAs = { ...assignedRAs };
      resetAssignedRAs[selectedBuilding.name] = [];
      setAssignedRAs(resetAssignedRAs);
    }
  }, [selectedBuilding]); // Only run when selectedBuilding changes

  // Function to open the modal with the building and optionally RA index for editing
  const handleOpenModal = (building, raIndex = null) => {
    setSelectedBuilding(building);
    setEditRAIndex(raIndex);
    setIsModalOpen(true);
  };

  // Function to handle the saving of a new RA or editing an existing RA
  const handleAssignRA = (inputs) => {
    const { 'RA Name': raName } = inputs;
    if (!raName) return;

    const [name, score] = raName.split(' - Score: ');

    const isAlreadyAssigned = Object.values(assignedRAs).some(assignments =>
      assignments.some(ra => ra.name === name)
    );
    if (isAlreadyAssigned && (editRAIndex === null || assignedRAs[selectedBuilding.name][editRAIndex].name !== name)) {
      alert(`RA "${name}" is already assigned to another building.`);
      return;
    }

    const assignedRAList = assignedRAs[selectedBuilding.name] || [];
    if (editRAIndex !== null) {
      // Editing an existing RA
      assignedRAList[editRAIndex] = { name, score };
    } else {
      // Adding a new RA
      if (assignedRAList.some(ra => ra.name === name)) {
        alert(`RA "${name}" is already assigned to ${selectedBuilding.name}.`);
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

  // Function to handle deleting an RA from a building's list
  const handleDeleteRA = (buildingName, index) => {
    const updatedAssignedRAs = { ...assignedRAs };
    updatedAssignedRAs[buildingName] = assignedRAs[buildingName].filter((_, i) => i !== index);
    setAssignedRAs(updatedAssignedRAs);
  };

  // Function to toggle the view of assigned RAs for a building
  const toggleShowAssignedRAs = (buildingName) => {
    setShowAssignedRAs((prevShowAssignedRAs) => ({
      ...prevShowAssignedRAs,
      [buildingName]: !prevShowAssignedRAs[buildingName],
    }));
  };

  // Function to generate a PDF of the building assignments
  const generatePDF = async () => {
    try {
      const pdf = new jsPDF();

      // Positioning variables
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
        assignedRAList.forEach((ra, raIndex) => {
          const raText = `${ra.name} ${ra.score ? `- Score: ${ra.score}` : ''}`;
          yOffset += lineHeight;

          // Using bullet points for each RA
          pdf.text(`\u2022 ${raText}`, 20, yOffset);
        });

        // Draw line separator
        yOffset += lineHeight / 2; // Adjusting for line thickness
        pdf.line(10, yOffset, 200, yOffset);
        yOffset += lineHeight / 2; // Space after the line
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
                    View RAs
                  </button>
                </div>
                {showAssignedRAs[building.name] && (
                  <ul className="assigned-ras">
                    {assignedRAList.map((ra, raIndex) => (
                      <li key={raIndex}>
                        {ra.name} {ra.score ? `- Score: ${ra.score}` : ''}
                        <div className="ra-actions">
                          <button onClick={() => handleOpenModal(building, raIndex)}>
                            Replace
                          </button>
                          <button className="delete-button" onClick={() => handleDeleteRA(building.name, raIndex)}>
                            Delete
                          </button>
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
            dropdownOptions={ras.filter(ra => !Object.values(assignedRAs).some(assignments => assignments.some(assigned => assigned.name === ra.name))).map((ra) => `${ra.name}${ra.score !== undefined ? ' - Score: ' + ra.score : ''}`)}
            dropdownLabel="RA Name"
            initialData={editRAIndex !== null ? { 'RA Name': `${assignedRAs[selectedBuilding.name][editRAIndex].name}${assignedRAs[selectedBuilding.name][editRAIndex].score ? ' - Score: ' + assignedRAs[selectedBuilding.name][editRAIndex].score : ''}` } : {}}
          />
        )}
      </div>
    </div>
  );
}

export default BuildingAssignments;