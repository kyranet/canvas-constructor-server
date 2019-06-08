// Copyright (c) Dirigeants. All rights reserved. MIT license.
// This is a derivative work of https://github.com/dirigeants/klasa-dashboard-hooks/blob/master/src/middlewares/json.js

import { IncomingMessage } from 'http';
import { createInflate, createGunzip, Inflate, Gunzip } from 'zlib';

export async function extractBody<T extends {}>(request: IncomingMessage): Promise<T | null> {
	if (request.method !== 'POST') return null;

	const stream = contentStream(request);
	if (!stream) return null;

	let body = '';
	for await (const chunk of stream) body += chunk;
	try {
		return JSON.parse(body);
	} catch (noop) {
		return null;
	}
}

function contentStream(request: IncomingMessage): Inflate | Gunzip | IncomingMessage | null {
	let stream: Inflate | Gunzip | IncomingMessage | null;
	switch ((request.headers['content-encoding'] || 'identity').toLowerCase()) {
		case 'deflate':
			stream = createInflate();
			request.pipe(stream);
			break;
		case 'gzip':
			stream = createGunzip();
			request.pipe(stream);
			break;
		case 'identity':
			stream = request;
			break;
		default:
			stream = null;
	}
	return stream;
}
