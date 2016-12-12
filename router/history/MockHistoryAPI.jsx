import {createElement} from 'react';
import _HnRouteHistoryAPI from './_HnRouteHistoryAPI.jsx';

import {routerConfig} from './events.jsx';


/**
 * Mock history api for testing
 */
export class MockHistoryAPI extends _HnRouteHistoryAPI {

	constructor(req, res, urlGetter) {
		super();

		this._req= req;
		this.response= res;

		this._defaultErrorHandler= {
			errorHandler: true,
			component: createElement('div', {}, '404 Not Found')
		};

		this._urlGetter= urlGetter;

		routerConfig.type= 'node';
	}


	// Finds the best match for the current request from the routes
	matchRoute(routes) {

		this._currentUrl= this._urlGetter();

		// Find the best match
		const route= this._findMatchRoute(routes, this._currentUrl, 'GET') || this._defaultErrorHandler;

		// Set the response status code
		this.response.statusCode= (route.errorHandler)? 404: (route.statusCode || 200);

		return {

			url: this._currentUrl,
			
			$component: this._getComponentFromClass(
				route.component, 
				route.props
			),

			controller: route.controller
		};
	}
}


