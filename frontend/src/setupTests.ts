import createFetchMock from 'vitest-fetch-mock';
import { vi as vitest } from 'vitest';

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const fetchMocker = createFetchMock(vitest);
// adds the 'fetchMock' global and rewires 'fetch' global to call 'fetchMock'
// instead of the real implementation
fetchMocker.enableMocks();
// changes default behavior of fetchMock to use the real 'fetch'
// implementation and not mock responses
fetchMocker.dontMock();
