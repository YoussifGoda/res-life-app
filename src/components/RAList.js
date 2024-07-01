import React, { useState } from 'react';
import Modal from './Modal';

function RAList({ ras: initialRas, addRA, deleteRA, updateRA }) {
  const [ras, setRas] = useState(initialRas); // State to manage the list of RAs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // State to track which RA is being edited
  const [modalInputs, setModalInputs] = useState({}); // State to hold modal inputs

  const handleAddRA = (inputs) => {
    const { 'RA Name': name, 'Score (optional)': score } = inputs;

    // Validate name: should be a non-empty string
    if (!name || typeof name !== 'string') {
      alert('RA Name must be a non-empty string.');
      return;
    }

    // Validate score: if provided, should be a number
    if (score !== undefined && isNaN(Number(score))) {
      alert('Score must be a number.');
      return;
    }

    // If editIndex is set, update the existing RA; otherwise, add a new RA
    if (editIndex !== null) {
      const updatedRAs = [...ras];
      updatedRAs[editIndex] = { name, score };
      setRas(updatedRAs);
      updateRA(editIndex, { name, score }); // Update RA in BuildingAssignments
      setEditIndex(null); // Reset editIndex after editing
    } else {
      addRA({ name, score });
      setRas([...ras, { name, score }]); // Add new RA to the list
    }

    setIsModalOpen(false);
    setModalInputs({}); // Reset modalInputs after save or cancel
  };

  const handleEditRA = (index, ra) => {
    // Set editIndex to the index of the RA being edited and populate modal fields
    setEditIndex(index);
    setModalInputs({ 'RA Name': ra.name, 'Score (optional)': ra.score }); // Populate modalInputs with existing RA data
    setIsModalOpen(true);
  };

  const handleDeleteRA = (index) => {
    // Filter out the RA at the specified index
    const deletedRA = ras[index];
    const updatedRAs = ras.filter((_, i) => i !== index);
    // Update the RAs state with the filtered list
    setRas(updatedRAs);
    deleteRA(index); // Notify parent component (App) of RA deletion
    updateRA(index, deletedRA, true); // Update BuildingAssignments with delete flag
  };

  return (
    <div className="section">
      <h2>RA List</h2>
      <button onClick={() => setIsModalOpen(true)}>Add RA</button>
      {isModalOpen && (
        <Modal
          onClose={() => {
            setIsModalOpen(false);
            setEditIndex(null); // Reset editIndex when closing modal
            setModalInputs({}); // Reset modalInputs after modal is closed
          }}
          onSave={handleAddRA}
          fields={['RA Name', 'Score (optional)']}
          initialValues={modalInputs} // Pass modalInputs to initialize modal fields
        />
      )}
      {/* Display the list of RAs below the button */}
      <ul>
        {ras.map((ra, index) => (
          <li key={index}>
            {index + 1}. {ra.name} {ra.score ? `- Score: ${ra.score}` : ''}
            <div className="ra-actions">
              <button onClick={() => handleEditRA(index, ra)}>Edit</button>
              <button className="delete-button" onClick={() => handleDeleteRA(index)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RAList;