module.exports = routes => {
	routes.forEach(route => {
		if(route.children) module.exports(route.children);
		if(route.component) route.component = route.component.default;
	});

	return routes;
};
