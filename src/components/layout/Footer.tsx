import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Herbarium Search. All rights reserved.</p>
          <p style={{ textAlign: 'left', marginTop: '2rem' }}>
            <img 
              src="https://webcentrum.muni.cz/media/3831863/seda_eosc.png" 
              alt="EOSC CZ Logo" 
              height="90" 
            />
          </p>
          <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
            This project output was developed with financial contributions from the EOSC CZ 
            initiative through the project National Repository Platform for Research Data 
            (CZ.02.01.01/00/23_014/0008787) funded by Programme Johannes Amos Comenius (P JAC) 
            of the Ministry of Education, Youth and Sports of the Czech Republic (MEYS).
          </p>
          <p style={{ textAlign: 'left', marginTop: '1rem' }}>
            <img 
              src="https://webcentrum.muni.cz/media/3832168/seda_eu-msmt_eng.png" 
              alt="EU and MŠMT Logos" 
              height="90" 
            />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
