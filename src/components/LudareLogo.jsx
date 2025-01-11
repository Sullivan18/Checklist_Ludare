import ludareLogo from '/dist/assets/ludare.png';

function LudareLogo() {
  return (
    <div className="ludare-logo">
      <img
        src={ludareLogo}
        alt="Ludare"
        className="logo-image"
      />
    </div>
  );
}

export default LudareLogo; 