import { useEffect, useState } from 'react';

export default function Navbar({ language = 'en', onLanguageChange = () => {} }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    [language === 'kn' ? 'ಮುಖಪುಟ' : 'HOME', '#home'],
    [language === 'kn' ? 'ಬೀಜ' : 'THE SEED', '#seed'],
    [language === 'kn' ? 'ಕೊಯ್ಲು' : 'THE HARVEST', '#harvest'],
    [language === 'kn' ? 'ಜೀವನ ವೆಚ್ಚ' : 'THE LIFE IT BUYS', '#life'],
    [language === 'kn' ? 'ಕಾಲ್‌ಬ್ಯಾಕ್' : 'CALL BACK', '#call']
  ];

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <a className="brand" href="#home" onClick={() => setOpen(false)}>
          <img className="brand__logo" src="/angel-logo.svg" alt="Angel Investments" />
          <span>
            <strong>Angel Investments</strong>
            <small>{language === 'kn' ? 'ಕಲಿ ಮತ್ತು ಸಂಪಾದಿಸಿ. ಸಂಪತ್ತಿನ ನಿರ್ವಹಣೆ ಮತ್ತು ವಿತರಣಾ ಸೇವೆ.' : 'Learn to Earn. Wealth Management & Distribution.'}</small>
          </span>
        </a>

        <button
          className={`nav-toggle ${open ? 'is-open' : ''}`}
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(prev => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${open ? 'is-open' : ''}`}>
          {links.map(([label, href]) => (
            <a key={label} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <label className="lang-switch" htmlFor="lang-select">
            {language === 'kn' ? 'ಭಾಷೆ' : 'Language'}
          </label>
          <select
            id="lang-select"
            className="lang-select"
            value={language}
            onChange={e => onLanguageChange(e.target.value)}
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="kn">Kannada</option>
          </select>
        </div>
      </div>
    </header>
  );
}
