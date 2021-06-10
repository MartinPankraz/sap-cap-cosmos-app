const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
	const { Sflight } = this.entities;
	const service = await cds.connect.to('cosmos');
	this.on('READ', Sflight, request => {
		return service.tx(request).run(request.query);
    });
    this.on('DELETE', Sflight, request => {
		return service.tx(request).run(request.query);
    });
    this.on('PATCH', Sflight, request => {
		return service.tx(request).run(request.query);
    });
    this.on('PUT', Sflight, request => {
		return service.tx(request).run(request.query);
    })
    this.on('POST', Sflight, request => {
		return service.tx(request).run(request.query);
	})
});