import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="header">
      <Link to="/" className="header__link">
        <div className="header__circle"></div>
      </Link>
      <h2>群組名稱</h2>
      <div className="header__avatarContainer">
        <img src="https://i.pravatar.cc/300" />
      </div>
    </header>
  )
}

export default Header
