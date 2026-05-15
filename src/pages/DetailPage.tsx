import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getRecordById} from '@services/api';
import {asArray, firstValue, HerbariumRecord} from '@types';
import MiradorViewer from "@components/search/MiradorViewer.tsx";

// ─── Small presentational helpers ────────────────────────────────────────────

interface FieldRowProps {
    label: string;
    value: React.ReactNode;
}

/** Single label + value row. Renders nothing when value is empty. */
const FieldRow: React.FC<FieldRowProps> = ({label, value}) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) return null;
    return (
        <tr className="detail-field-row">
            <th className="detail-field-label">{label}</th>
            <td className="detail-field-value">{value}</td>
        </tr>
    );
};

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

/** Collapsible section wrapper. Hidden when all children are null. */
const Section: React.FC<SectionProps> = ({title, children}) => {
    // Check if any child rendered (React doesn't expose this easily, so we
    // always render the section and rely on FieldRow to suppress empty rows)
    return (
        <div className="detail-section">
            <h2 className="detail-section__title">{title}</h2>
            <table className="detail-table">
                <tbody>{children}</tbody>
            </table>
        </div>
    );
};

// ─── Loading / error states ───────────────────────────────────────────────────

const LoadingState: React.FC = () => (
    <div className="detail-page">
        <div className="container">
            <div className="detail-loading" role="status" aria-live="polite">
                <div className="spinner-border text-success" aria-hidden="true"/>
                <span className="visually-hidden">Loading images…</span>
            </div>
        </div>
    </div>
);

interface ErrorStateProps {
    message: string;
    onBack: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({message, onBack}) => (
    <div className="detail-page">
        <div className="container py-4">
            <div className="alert alert-danger" role="alert">{message}</div>
            <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
                ← Go back
            </button>
        </div>
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const DetailPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [record, setRecord] = useState<HerbariumRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        getRecordById(decodeURIComponent(id))
            .then(setRecord)
            .catch((err) => {
                console.error('Fetch error:', err);
                setError('Failed to load images details. Please try again.');
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <LoadingState/>;
    if (error || !record) return <ErrorState message={error ?? 'Record not found'} onBack={() => navigate(-1)}/>;

    // ── Derived display values ─────────────────────────────────────────────────
    const scientificName = firstValue(record.scientific_name) ?? firstValue(record.title) ?? record.id;
    const collectors = asArray(record.creator);
    const recordedBy = asArray(record.recorded_by);
    const localities = asArray(record.locality);
    const herbariumAcronyms = asArray(record.herbarium_acronym);
    // const collectionCodes = asArray(record.collection_code);
    const prevIds = asArray(record.previous_identifications);

    // Show recorded_by only if it differs from creator
    const showRecordedBy =
        recordedBy.length > 0 &&
        recordedBy.join('|') !== collectors.join('|');

    return (
        <div className="detail-page">
            {/* ── Header banner ──────────────────────────────────────────────────── */}
            <div className="detail-header">
                <div className="container">
                    <button
                        className="btn btn-link detail-header__back p-0 mb-1"
                        onClick={() => navigate(-1)}
                        aria-label="Back to results"
                    >
                        ← Back to results
                    </button>
          {/*          <h1 className="detail-header__title">{scientificName}</h1>*/}
          {/*          <div className="detail-header__meta">*/}
          {/*<span className="me-2">*/}
          {/*  {herbariumAcronyms.length > 0 && herbariumAcronyms.join(', ')}&nbsp;*/}
          {/*    {record.catalog_number && record.catalog_number}*/}
          {/*</span>*/}
          {/*          </div>*/}
                </div>
            </div>

            {/* ── Body ───────────────────────────────────────────────────────────── */}
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12 col-lg-5">

                        {/* ── Taxonomy ─────────────────────────────────────────────────── */}
                        <Section title="Taxonomy">
                            <FieldRow label="Scientific name" value={<em>{scientificName}</em>}/>
                            <FieldRow label="Family" value={record.family}/>
                            <FieldRow label="Genus" value={record.genus}/>
                            <FieldRow label="Specific epithet" value={record.specific_epithet}/>
                            {prevIds.length > 0 && (
                                <FieldRow
                                    label="Previous identifications"
                                    value={prevIds.join(' → ')}
                                />
                            )}
                        </Section>

                        {/* ── Collection ───────────────────────────────────────────────── */}
                        <Section title="Collection">
                            {collectors.length > 0 && (
                                <FieldRow
                                    label="Collector(s)"
                                    value={collectors.join('; ')}
                                />
                            )}
                            {showRecordedBy && (
                                <FieldRow label="Recorded by" value={recordedBy.join('; ')}/>
                            )}
                            <FieldRow label="Collection date" value={record.event_date_raw}/>
                            <FieldRow label="Catalog number" value={record.catalog_number}/>
                            {/*{collectionCodes.length > 0 && (*/}
                            {/*  <FieldRow label="Collection code" value={collectionCodes.join(', ')} />*/}
                            {/*)}*/}
                            {herbariumAcronyms.length > 0 && (
                                <FieldRow label="Herbarium" value={herbariumAcronyms.join(', ')}/>
                            )}
                        </Section>

                        {/* ── Location ─────────────────────────────────────────────────── */}
                        <Section title="Location">
                            {localities.length > 0 && (
                                <FieldRow
                                    label="Locality"
                                    value={localities.join('; ')}
                                />
                            )}
                            <FieldRow label="Country" value={record.country}/>
                            <FieldRow label="Country code" value={record.country_code}/>
                        </Section>

                        {/* ── Identifiers & links ───────────────────────────────────────── */}
                        <Section title="Identifiers">
                            <FieldRow label="Image Record"
                                      value={
                                          <a
                                              href={`https://n2t.org/${record.id}`}
                                              rel="noopener noreferrer"
                                              className="detail-link"
                                          >
                                              {record.id}
                                          </a>
                                      }
                            />
                            {record.material_sample_id && (
                                <FieldRow
                                    label="Floristic Record"
                                    value={
                                        <a
                                            href={record.material_sample_id}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="detail-link"
                                        >
                                            {record.material_sample_id}
                                        </a>
                                    }
                                />
                            )}
                            <FieldRow label="Basis of record" value={record.basis_of_record}/>
                        </Section>

                    </div>
                    <div className="col-md-12 col-lg-7">
                        <div className="mirador-container">
                            <MiradorViewer
                                manifestUrl={`https://herbarium.biodiversity.cz/iiif/manifest/${record.herbarium_acronym} ${record.catalog_number}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPage;
