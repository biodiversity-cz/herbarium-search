import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <div className="container">
            <p>version: <b>v0.1</b> {new Date().getFullYear()} || NRP KA 3.3
              <a href="https://github.com/biodiversity-cz" className="notion-link" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><title>GitHub </title>
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                </svg>
              </a> 2026 onwards</p></div>
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
