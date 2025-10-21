/*
 * TAKEDA CONFIDENTIAL – Highly Restricted: Do not distribute without prior approval
 *
 * © Copyright (2020) Takeda. All Rights Reserved
 */

import { consoleTransport, logger } from 'react-native-logs';

type Logger = {
  debug: (...params: unknown[]) => void;
  error: (...params: unknown[]) => void;
  info: (...params: unknown[]) => void;
  setSeverity: (logLevel: string) => void;
  warn: (...params: unknown[]) => void;
};

const defaultConfig = {
  levels: {
    debug: 0,
    error: 3,
    info: 1,
    warn: 2,
  },
  transport: consoleTransport,
  transportOptions: {
    colors: 'ansi',
  },
  printDate: false,
};

const log = (logger.createLogger(defaultConfig) as unknown) as Logger;

log.setSeverity("debug");

export { log as logger };
