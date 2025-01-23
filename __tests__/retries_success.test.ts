import { expect, jest, test, } from '@jest/globals';
import * as path from 'path';

// import * as dockerModule from '../src/docker';

import { login } from '../src/docker';
import { Docker } from '@docker/actions-toolkit/lib/docker/docker';

test('login retries success function', async () => {
  // let stderr_strings: string[] = []
  let stderr_strings: string[] = [
    'mock error, failed with status: 408 Request Timeout',
    'mock error, failed with status: 502 Request Timeout',
    'mock error, failed with status: 400 Request Timeout',
  ]
  let call_count: number = -1

  Docker.getExecOutput = jest.fn(async () => {
    call_count++
    console.log(`Mock: ${call_count}, ${stderr_strings}`)
    if (call_count >= stderr_strings.length) {
      return {
        exitCode: 0,
        stdout: 'Mock success',
        stderr: ''
      }
    }
    return {
      exitCode: 1,
      stdout: '',
      stderr: stderr_strings[(call_count) % stderr_strings.length]
    }
  })

  const username = 'dbowie';
  const password = 'groundcontrol';
  const registry = 'https://ghcr.io';

  // stderr_strings = []
  call_count = -1
  expect(async () => {
    await login(registry, username, password, 'false', ['408', '502', '400'], 5, 0.1);
  })
    .resolves;
  expect(Docker.getExecOutput).toHaveBeenCalledTimes(1);

  stderr_strings = [
    'mock error, failed with status: 408 Request Timeout',
    'mock error, failed with status: 502 Request Timeout',
    'mock error, failed with status: 400 Request Timeout',
  ]
  call_count = -1
  expect(async () => {
    await login(registry, username, password, 'false', ['408', '502', '400'], 5, 0.1);
  })
    .resolves;
  expect(Docker.getExecOutput).toHaveBeenCalledTimes(0);
});
