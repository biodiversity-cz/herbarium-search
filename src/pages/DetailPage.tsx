import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecordById } from '@services/api';
import { HerbariumRecord } from '@types/index';

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<HerbariumRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRecord(id);
    }
  }, [id]);

  const fetchRecord = async (recordId: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getRecordById(recordId);
      setRecord(data);
    } catch (err) {
      setError('Failed to fetch record details. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            {error || 'Record not found'}
          </div>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="container">
        <div className="specimen-detail">
          <div className="back-button">
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
              ← Back to Results
            </button>
          </div>

          <div className="specimen-header">
            <h1>{record.scientificName}</h1>
            <div className="catalog-number">
              Catalog Number: {record.catalogNumber}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              {record.imageUrl && (
                <div className="specimen-image-container">
                  <img
                    src={record.imageUrl}
                    alt={record.scientificName}
                    className="img-fluid"
                  />
                </div>
              )}
            </div>

            <div className="col-md-6">
              <div className="specimen-info">
                <div className="info-section">
                  <h3>Taxonomy</h3>
                  {record.family && (
                    <div className="info-row">
                      <div className="info-label">Family:</div>
                      <div className="info-value">{record.family}</div>
                    </div>
                  )}
                  {record.genus && (
                    <div className="info-row">
                      <div className="info-label">Genus:</div>
                      <div className="info-value">{record.genus}</div>
                    </div>
                  )}
                  {record.species && (
                    <div className="info-row">
                      <div className="info-label">Species:</div>
                      <div className="info-value">{record.species}</div>
                    </div>
                  )}
                  {record.author && (
                    <div className="info-row">
                      <div className="info-label">Author:</div>
                      <div className="info-value">{record.author}</div>
                    </div>
                  )}
                </div>

                <div className="info-section">
                  <h3>Collection Information</h3>
                  {record.collector && (
                    <div className="info-row">
                      <div className="info-label">Collector:</div>
                      <div className="info-value">{record.collector}</div>
                    </div>
                  )}
                  {record.collectionDate && (
                    <div className="info-row">
                      <div className="info-label">Collection Date:</div>
                      <div className="info-value">{record.collectionDate}</div>
                    </div>
                  )}
                  {record.institution && (
                    <div className="info-row">
                      <div className="info-label">Institution:</div>
                      <div className="info-value">{record.institution}</div>
                    </div>
                  )}
                </div>

                <div className="info-section">
                  <h3>Location</h3>
                  {record.country && (
                    <div className="info-row">
                      <div className="info-label">Country:</div>
                      <div className="info-value">{record.country}</div>
                    </div>
                  )}
                  {record.locality && (
                    <div className="info-row">
                      <div className="info-label">Locality:</div>
                      <div className="info-value">{record.locality}</div>
                    </div>
                  )}
                  {record.habitat && (
                    <div className="info-row">
                      <div className="info-label">Habitat:</div>
                      <div className="info-value">{record.habitat}</div>
                    </div>
                  )}
                  {record.altitude && (
                    <div className="info-row">
                      <div className="info-label">Altitude:</div>
                      <div className="info-value">{record.altitude} m</div>
                    </div>
                  )}
                  {(record.latitude && record.longitude) && (
                    <div className="info-row">
                      <div className="info-label">Coordinates:</div>
                      <div className="info-value">
                        {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                      </div>
                    </div>
                  )}
                </div>

                {(record.determiner || record.determinationDate || record.notes) && (
                  <div className="info-section">
                    <h3>Additional Information</h3>
                    {record.determiner && (
                      <div className="info-row">
                        <div className="info-label">Determiner:</div>
                        <div className="info-value">{record.determiner}</div>
                      </div>
                    )}
                    {record.determinationDate && (
                      <div className="info-row">
                        <div className="info-label">Determination Date:</div>
                        <div className="info-value">{record.determinationDate}</div>
                      </div>
                    )}
                    {record.notes && (
                      <div className="info-row">
                        <div className="info-label">Notes:</div>
                        <div className="info-value">{record.notes}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
