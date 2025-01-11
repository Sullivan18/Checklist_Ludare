  return (
    <div className={`checklist-page ${pageLoaded ? 'loaded' : ''}`}>
      <div className="checklist-header">
        <div className="header-top">
          <h1 className="checklist-title">
            <span className="title-icon">{checklist.icon}</span>
            {checklist.title}
          </h1>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            <span className="progress-text">{progress}% concluído</span>
          </div>
        </div>
        <div className="header-controls">
          <div className="filter-buttons">
            {/* ... existing filter buttons ... */}
          </div>
        </div>
      </div>

      {/* ... rest of the component ... */}
    </div>
  ); 