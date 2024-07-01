import React, { useState } from 'react';
import Modal from './Modal';

function RAList({ ras, addRA, deleteRA, updateRA }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [modalInputs, setModalInputs] = useState({});

  const handleAddRA = (inputs) => {
    const { 'RA Name': name, 'Score (optional)': score } = inputs;

    if (!name || typeof name !== 'string') {
      alert('RA Name must be a non-empty string.');
      return;
    }

    if (score !== undefined && isNaN(Number(score))) {
      alert('Score must be a number.');
      return;
    }

    if (editIndex !== null) {
      updateRA(editIndex, { name, score });
      setEditIndex(null);
    } else {
      addRA({ name, score });
    }

    setIsModalOpen(false);
    setModalInputs({});
  };

  const handleEditRA = (index, ra) => {
    setEditIndex(index);
    setModalInputs({ 'RA Name': ra.name, 'Score (optional)': ra.score });
    setIsModalOpen(true);
  };

  const handleDeleteRA = (index) => {
    deleteRA(index);
  };

  return (
    <div className="section">
      <h2>RA List</h2>
      <button onClick={() => setIsModalOpen(true)}>Add RA</button>
      {isModalOpen && (
        <Modal
          onClose={() => {
            setIsModalOpen(false);
            setEditIndex(null);
            setModalInputs({});
          }}
          onSave={handleAddRA}
          fields={['RA Name', 'Score (optional)']}
          initialValues={modalInputs}
        />
      )}
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
