const spawn = require('./lib/spawn');
const reg_progress = /([\d]+)%/;
const EventEmitter = require('events');

export class Unrar extends EventEmitter {

	/**
	 * uncompress .rar file
	 * @param {String} src source file path
	 * @param {String} dest destination folder path
	 * @param {String} [command='x'] command of unrar, default: x
	 * @param {String[]} [switches] switches of unrar, default: []
	 */
	uncompress({src, dest, command = 'x', switches = []}) {

		let errMsg = '';

		return new Promise((resolve, reject) => {

			const unrar = spawn(
				[command, ...switches, src, dest], 
				{ stdio: [0, 'pipe', 'pipe'] }
			);

			unrar.stderr.on('data', chunk => {

				const data = chunk.toString();

				if (reg_password.test(data)) {
					const error = new Error('Password protected file');
					return reject(error);
				}

				errMsg += data;

			});

			unrar.stdout.on('data', chunk => {

				const data = chunk.toString();
				const match = data.match(reg_progress);
				(match !== null) && this.emit('progress', Number(match[1]));

			});

			unrar.on('exit', code => {

				if (code !== 0 || errMsg) {
					const error = new Error(errMsg);
					error.code = code;
					return reject(error);
				}

				this.emit('progress', 100);
				resolve('over');
				
			});

		})

	}
}