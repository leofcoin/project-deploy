import json from  '@rollup/plugin-json'
import { execSync } from 'child_process'

try {
	execSync('rm -rf ./dist/*')
} catch (e) {

}

export default [{
		input: ['./src/project-deploy.js', './src/tasks/tasks.js', './src/utils.js'],
		plugins: [json()],
		output: {
			dir: 'dist',
			format: 'cjs'
		}
	}
];
