// Copyright (c) 2019 Antonio Román. All rights reserved. MIT license.

import * as cluster from 'cluster';
import { Cluster } from './lib/Cluster';
import { Worker } from './lib/Worker';

if (cluster.isMaster) {
	new Cluster().on('ready',
		() => console.log(`[INFO] Cluster Ready ${process.pid}`));
} else {
	new Worker().on('ready',
		() => console.log(`[INFO] Worker Ready ${process.pid}`));
}
