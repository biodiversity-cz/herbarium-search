import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HerbariumRecord } from '@types/index';

interface ResultCardProps {
  record: HerbariumRecord;
}

const ResultCard: React.FC<ResultCardProps> = ({ record }) => {
  const navigate = useNavigate();

  return (
    <div
      className="card result-card mb-3"
      onClick={() => navigate(`/detail/${record.id}`)}
      role="button"
    >
      <div className="card-body">
        <div className="row">
          <div className="col-md-2">
            {record.thumbnailUrl && (
              <img
                src={record.thumbnailUrl}
                alt={record.scientificName}
                className="result-image img-fluid"
              />
            )}
          </div>
          <div className="col-md-10">
            <h5 className="result-title mb-2">{record.scientificName}</h5>
            <div className="result-meta">
              <p className="mb-1">
                <strong>Catalog Number:</strong> {record.catalogNumber}
              </p>
              {record.family && (
                <p className="mb-1">
                  <strong>Family:</strong> {record.family}
                </p>
              )}
              {record.collector && (
                <p className="mb-1">
                  <strong>Collector:</strong> {record.collector}
                </p>
              )}
              {record.locality && (
                <p className="mb-1">
                  <strong>Locality:</strong> {record.locality}, {record.country}
                </p>
              )}
              {record.collectionDate && (
                <p className="mb-1">
                  <strong>Collection Date:</strong> {record.collectionDate}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
