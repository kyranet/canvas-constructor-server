// Copyright (c) 2019 Antonio Román. All rights reserved. MIT license.

import * as cluster from 'cluster';
import * as os from 'os';
import { EventEmitter } from 'events';

export class Cluster extends EventEmitter {

	public constructor(amount: number = os.cpus().length) {
		super();
		for (let i = 0; i < amount; i++) {
			cluster.fork();
		}
		this.emit('ready');
	}

	public get(): cluster.Worker {
		return cluster.worker;
	}

}
