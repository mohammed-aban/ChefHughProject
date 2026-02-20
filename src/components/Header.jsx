import chefHughIcon from "../assets/chef-hugh-icon.svg";

export default function Header({ isDarkMode, onToggleTheme }) {
	return (
		<header className="header">
			<div className="header__content">
				<div className="header__brand">
					<img
						className="header__icon"
						src={chefHughIcon}
						alt="Chef Hugh"
						aria-hidden="true"
					/>
					<span className="header__title">Chef Hugh</span>
				</div>
				<div className="theme-toggle-wrap">
					<button
						type="button"
						className="theme-toggle"
						onClick={onToggleTheme}
						aria-pressed={isDarkMode}
						aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
					>
						<span className="theme-toggle__track">
							<span className="theme-toggle__thumb" />
						</span>
					</button>
					<span className="theme-toggle__text" aria-live="polite">
						{isDarkMode ? "Dark" : "Light"}
					</span>
				</div>
			</div>
		</header>
	);
}
