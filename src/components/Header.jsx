import chefHughIcon from "../assets/chef-hugh-icon.svg";

export default function Header() {
	return (
		<header className="header">
			<div className="header__content">
				<img
					className="header__icon"
					src={chefHughIcon}
					alt="Chef Hugh"
					aria-hidden="true"
				/>
				<span className="header__title">Chef Hugh</span>
			</div>
		</header>
	);
}
