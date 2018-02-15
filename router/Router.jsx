
import React from 'react';
import PropTypes from 'prop-types';

import _HnRouteHistoryAPI from './history/_HnRouteHistoryAPI.jsx';

// Error components
const DEFAULTERROR= 'Something went wrong';
const NULLCOMPONENTERROR= 'The component cannot be null';
const HISTORYTYPEERROR= 'The prop `history` has to be an instance of either HistoryAPI or NodeHistoryAPI';



/**
 * Route declaration component
 */
export class Route extends React.Component {
	render() { return null; }
}

Route.propTypes= {

	caseInsensitive: PropTypes.bool,

	statusCode: PropTypes.number,

	errorHandler: PropTypes.bool,

	controller: PropTypes.func,

	method: PropTypes.string,

	component: PropTypes.func.isRequired
};



/**
 * Router wrapper
 */
export class Router extends React.Component {

	_EMPTY_ROUTER = (<Route component={() => null} />);

	constructor(props) {
		super(props);

		this.state = { currentUrl: '/' };

		this._routes= 
			this.props.children
				.filter(
					comp => 
						(comp.type === (this._EMPTY_ROUTER).type))
				.map( val => val.props );

		if(!(this.props.history instanceof _HnRouteHistoryAPI))
			throw new Error(HISTORYTYPEERROR);
	}


	// Life cycle methods only executes on the client-side
	componentDidMount() {

		this.props.history.routeChangeListener(data =>
			this.setState({ currentUrl: data.url })
		);
	}

	componentWillUnmount() {
		this.props.history.removeChangeListener();
	}

	render() {

		if(this.props.history.response && this.props.history.response.hasTerminated) {
			return null;
		}

		const route = this.props.history.matchRoute(this._routes);

		if(!route) {
			throw new Error(DEFAULTERROR);
		}

		if(!route.$component) {
			throw new Error(NULLCOMPONENTERROR);
		}


		// The default props
		let defaultProps = {
			routerProps: {
				url: this.state.currentUrl,
				location: this.props.history.location
			}
		};

		// Call the router controller
		if(route.controller) {
			route.controller(_props =>
				defaultProps = Object.assign(defaultProps, _props));
		}


		// Either render the route component or wrap it in a wrapper and render
		let $reactElement = route.$component;

		// If its on the serverside and the wrapper is a function
		if(this.props.history.response && typeof(this.props.wrapper) === 'function') {

			const Wrapper = this.props.wrapper;

			$reactElement = <Wrapper>{route.$component}</Wrapper>;
		}

		return React.cloneElement(
			$reactElement, 
			defaultProps
		);
	}
}

Router.propTypes = {

	wrapper: PropTypes.func,

	history: PropTypes.object.isRequired
};
