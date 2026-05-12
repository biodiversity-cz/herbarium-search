import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HerbariumRecord, firstValue, asArray } from '@types';

interface ResultCardProps {
  record: HerbariumRecord;
}

const ResultCard: React.FC<ResultCardProps> = ({ record }) => {
  const navigate = useNavigate();

  const scientificName = firstValue(record.scientific_name) ?? firstValue(record.title) ?? record.id;
  const collector = asArray(record.creator).join(', ');
  const locality = firstValue(record.locality);
  const herbarium = asArray(record.herbarium_acronym).join(', ');

  return (
    <div
      className="card result-card mb-2"
      onClick={() => navigate(`/detail/${encodeURIComponent(record.id)}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/detail/${encodeURIComponent(record.id)}`)}
      aria-label={`View details for ${scientificName}`}
    >
      <div className="card-body py-3">
        <div className="d-flex gap-3 align-items-start">
          <div className="flex-grow-1 min-width-0">
            <h5 className="result-title mb-1">{scientificName}</h5>
            <div className="result-meta d-flex flex-wrap gap-x-3 gap-2">
              {record.family && (
                <span>
                  <span className="result-meta__label">Family</span>{' '}
                  {record.family}
                </span>
              )}
              {collector && (
                <span>
                  <span className="result-meta__label">Collector</span>{' '}
                  {collector}
                </span>
              )}
              {locality && (
                <span>
                  <span className="result-meta__label">Locality</span>{' '}
                  {locality}
                  {record.country ? `, ${record.country}` : ''}
                </span>
              )}
              {record.event_date_raw && (
                <span>
                  <span className="result-meta__label">Date</span>{' '}
                  {record.event_date_raw}
                </span>
              )}
            </div>
          </div>
          <div className="result-card__badges flex-shrink-0 text-end">
            {herbarium && (
              <span className="badge bg-taxon">{herbarium}</span>
            )}
            {record.catalog_number && (
              <div className="result-card__catalog mt-1">{record.catalog_number}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
