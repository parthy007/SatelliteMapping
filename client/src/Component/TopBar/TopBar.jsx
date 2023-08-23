import "./TopBar.css";
import GalaxyEyeLogo from "../../assests/galaxyeyelogo.jpg"

export const TopBar = () => {
  return (
    <div className="topBar">
      <div className="logoContainer">
          <img src={GalaxyEyeLogo} alt="logo" className="logo"/>
          <div className="taglineContainer">
            <p className="tagline">Sensing Beyond Vision</p>
          </div>
      </div>
    </div>
  )
}
