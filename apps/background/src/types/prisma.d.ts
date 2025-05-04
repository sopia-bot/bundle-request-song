import { PrismaClient as OriginalPrismaClient } from '../prisma';

declare global {
  var __pkgdir: string;

  function bunx(
    command: ReadonlyArray<string>,
    options?: import('child_process').SpawnOptions
  ): Promise<void>;
}

declare module '../prisma' {
  export class PrismaClient implements OriginalPrismaClient {
    constructor(options?: any);
    $executeRawUnsafe: (query: string, ...values: any[]) => Promise<number>;
    $queryRawUnsafe: (query: string, ...values: any[]) => Promise<any>;
  }
}
