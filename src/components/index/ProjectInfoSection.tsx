import React from 'react';

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon }) => (
  <div className="col-6 col-md-3">
    <div className="stat-card">
      <div className="stat-icon" aria-hidden="true">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <div className="col-md-4">
    <div className="feature-card">
      <div className="feature-icon" aria-hidden="true">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  </div>
);

/**
 * Below-the-fold section with project statistics and feature highlights.
 * Placeholder values are clearly marked and easy to replace.
 */
const ProjectInfoSection: React.FC = () => {
  return (
    <section className="project-info-section">
      {/* ── Statistics row ─────────────────────────────────────────── */}
      <div className="stats-band">
        <div className="container">
          <div className="row g-4 justify-content-center">
            <StatCard
              value="50 000+"
              label="Digitised specimens"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                </svg>
              }
            />
            <StatCard
              value="5"
              label="Contributing herbaria"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                </svg>
              }
            />
            <StatCard
              value="3 000+"
              label="Species represented"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3.293 4.854 6.44a.5.5 0 0 1-.708-.708L8 1.586l3.854 4.146a.5.5 0 0 1-.708.708L8 3.293zm0 4 4.146 4.146a.5.5 0 0 1-.708.708L8 8.707l-3.438 3.44a.5.5 0 0 1-.708-.708L8 7.293z"/>
                </svg>
              }
            />
            <StatCard
              value="Open"
              label="Access & FAIR data"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z"/>
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* ── About the project ──────────────────────────────────────── */}
      <div className="about-band">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="section-eyebrow">About the project</span>
              <h2 className="section-title">Czech Herbarium Network</h2>
              <p className="section-body">
                The Czech Repository of Herbarium Specimen Images (HerbCol) aggregates digitised
                collection photos from herbaria across the Czech Republic, making centuries of botanical
                knowledge freely accessible to researchers, educators, and the public.
              </p>
              <p className="section-body">
                All data are published under open licences and conform to the{' '}
                <strong>FAIR principles</strong> (Findable, Accessible, Interoperable, Reusable),
                supporting integration with global biodiversity infrastructures such as GBIF and
                DiSSCo.
              </p>
              {/* TODO: replace with real link when available */}
              <a href="#" className="btn btn-outline-herb mt-2">
                Learn more about the project
              </a>
            </div>
            <div className="col-lg-6">
              <img src="/assets/herbarium.jpg" className="img-fluid" />
              {/*<div className="placeholder-image-block" aria-hidden="true">*/}
              {/*  <p className="placeholder-label">Project image placeholder</p>*/}
              {/*</div>*/}
            </div>
          </div>
        </div>
      </div>

      {/* ── Feature highlights ─────────────────────────────────────── */}
      <div className="features-band">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-eyebrow">What you can do</span>
            <h2 className="section-title">Explore the collection</h2>
          </div>
          <div className="row g-4">
            <FeatureCard
              title="Smart autocomplete"
              description="Search across taxa, collectors, and localities simultaneously. The intelligent suggester draws from three dedicated Solr dictionaries."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.156a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
                </svg>
              }
            />
            <FeatureCard
              title="Faceted filtering"
              description="Narrow results by taxon, collector, and locality using interactive facets. Combine multiple values to pinpoint exactly what you need."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                </svg>
              }
            />
            <FeatureCard
              title="High-resolution images"
              description="Browse digitised specimen sheets with high-resolution imagery, label transcriptions, and full provenance metadata."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                  <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* ── Partners / funding ─────────────────────────────────────── */}
      <div className="partners-band">
        <div className="container">
          <div className="text-center mb-4">
            <span className="section-eyebrow">Supported by</span>
          </div>
          <div className="partners-logos">
            <img
              src="https://webcentrum.muni.cz/media/3831863/seda_eosc.png"
              alt="EOSC CZ"
              className="partner-logo"
            />
            <img
              src="https://webcentrum.muni.cz/media/3832168/seda_eu-msmt_eng.png"
              alt="EU and MŠMT"
              className="partner-logo"
            />
          </div>
          <p className="partners-note">
            This project output was developed with financial contributions from the EOSC CZ
            initiative through the project National Repository Platform for Research Data
            (CZ.02.01.01/00/23_014/0008787) funded by Programme Johannes Amos Comenius (P JAC)
            of the Ministry of Education, Youth and Sports of the Czech Republic (MEYS).
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProjectInfoSection;
