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

		this.server = http.createServer(
			(request, response) => this.process(request, response));
		this.server.listen(port, () => this.emit('ready'));
	}

	private async process(request: http.IncomingMessage, response: http.ServerResponse) {
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Access-Control-Allow-Methods', 'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT');
		response.setHeader('Access-Control-Allow-Headers', 'Authorization, User-Agent, Content-Type');

		const body = await extractBody<Message>(request);
		if (!body) {
			response.setHeader('Content-Type', 'application/json');
			response.writeHead(400);
			response.end('{"success":false,"reason":"Failed to read JSON body."}');
			return;
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
			response.setHeader('Content-Type', 'image/png');
			response.writeHead(200);
			response.write(buffer, 'binary');
			response.end(null, 'binary');
		} catch (error) {
			response.setHeader('Content-Type', 'application/json');
			response.writeHead(500);
			response.end(JSON.stringify({ success: false, reason: error.message }));
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

export type Filter = 'invert' |
	'greyscale' |
	'sepia' |
	'silhouette' |
	'threshold' |
	'invertedThreshold' |
	'sharpen' |
	'blur' |
	'convolute';
