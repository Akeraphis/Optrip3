FlowRouter.route('/',{
	name: 'home',
	action() {
		BlazeLayout.render('mainLayout', {main: 'home'});
	}
});

FlowRouter.route('/progression',{
	name: 'progression',
	action() {
		BlazeLayout.render('mainLayout', {main: 'progression'});
	}
});

FlowRouter.route('/masterdata/airports',{
	name:'mdairports',
	action() {
		BlazeLayout.render('mainLayout', {main: 'mdairports'});
	}
});

FlowRouter.route('/masterdata/airlines',{
	name:'mdairlines',
	action() {
		BlazeLayout.render('mainLayout', {main: 'mdairlines'});
	}
});


FlowRouter.route('/masterdata/interestPoints',{
	name:'mdips',
	action() {
		BlazeLayout.render('mainLayout', {main: 'mdips'});
	}
});

FlowRouter.route('/masterdata/interestPoints/:ipid',{
	name:'mdip',
	action() {
		BlazeLayout.render('mainLayout', {main: 'mdip'});
	}
});

FlowRouter.route('/masterdata/fares',{
	name:'mdff',
	action() {
		BlazeLayout.render('mainLayout', {main: 'mdff'});
	}
});

FlowRouter.route('/masterdata/others',{
	name:'mdothers',
	action() {
		BlazeLayout.render('mainLayout', {main: 'mdothers'});
	}
});

FlowRouter.route('/optimization/results',{
	name:'results',
	action() {
		BlazeLayout.render('mainLayout', {main: 'results'});
	}
});