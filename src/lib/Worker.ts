// Copyright (c) 2019 Antonio Román. All rights reserved. MIT license.

import * as http from 'http';
import { EventEmitter } from 'events';
import * as CC from 'canvas-constructor';
import { extractBody } from './util/ResponseBody';

const { Canvas, ...methods } = CC;

export class Worker extends EventEmitter {

	public server: http.Server;
	public constructor(port: number = 8000) {
		super();

		this.server = http.createServer(this.process.bind(this));
		this.server.listen(port, () => this.emit('ready'));
	}

	private async process(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
		response.setHeader('Access-Control-Allow-Headers', '*');

		if (request.method !== 'POST') {
			response.writeHead(405, { 'Content-Type': 'application/json' });
			return response.end('{"success":false,"reason": "Method Not Allowed"}');
		}

		const body = await extractBody<Message>(request);
		if (!body) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			return response.end('{"success":false,"reason":"Failed to read JSON body."}');
		}

		try {
			const canvas = new Canvas(body.width, body.height);
			for (const command of body.commands) {
				if (command.type === CommandKind.Filter) {
					// @ts-ignore
					canvas.process(methods[command.filter], ...command.arguments);
				} else {
					// @ts-ignore
					canvas[command.command](...command.arguments);
				}
			}
			const buffer = await canvas.toBufferAsync();

			response.writeHead(200, { 'Content-Type': 'image/png' });
			return response.end(buffer, 'binary');
		} catch (error) {
			response.writeHead(500, { 'Content-Type': 'application/json' });
			return response.end(JSON.stringify({ success: false, reason: error.message }));
		}
	}

}

export interface Message {
	width: number;
	height: number;
	commands: readonly (CommandInstance | CommandFilter)[];
}

export interface CommandInstance {
	type: CommandKind.Instance;
	command: CommandName;
	arguments: readonly any[];
}

type ValueOf<T> = T[keyof T];
type CommandName = Exclude<ValueOf<{ [K in keyof CC.Canvas]: CC.Canvas[K] extends Function ? K : never; }>, 'process'>;

export interface CommandFilter {
	type: CommandKind.Filter;
	filter: Filter;
	arguments: readonly any[];
}

export enum CommandKind {
	Instance,
	Filter
}

export type Filter = 'invert' | 'greyscale' | 'sepia' | 'silhouette' | 'threshold' | 'invertedThreshold' | 'sharpen' | 'blur' | 'convolute';
