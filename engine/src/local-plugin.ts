/**
 * A Vite / Rollup / Rolldown plugin for bundling `engine/local` into a page
 * (`engine/local-plugin`): it resolves the engine's `cards/default-registry`
 * — the registry a game or a bot falls back on, the one route from `Game` and
 * the bots to the whole card pool — to `cards/default-registry.browser`, which
 * refuses. A page builds its registry from the card shards (`registryFrom`)
 * and passes it in. `local.ts` explains the swap; `test/local-entry.test.ts`
 * walks the source with it and `test/local-bundle.test.ts` bundles with this.
 *
 * Typed structurally rather than against a bundler's own types, so the engine
 * depends on none of them.
 */

const DEFAULT_REGISTRY = /[\\/]engine[\\/](dist|src)[\\/]cards[\\/]default-registry\.(js|ts)$/;

interface ResolvedId {
  readonly id: string;
}

interface PluginContext {
  resolve(source: string, importer: string, options: object): Promise<ResolvedId | null>;
}

export interface EngineLocalPlugin {
  readonly name: string;
  readonly enforce: "pre";
  resolveId(this: PluginContext, source: string, importer: string | undefined, options: object): Promise<string | null>;
}

export function engineLocalPlugin(): EngineLocalPlugin {
  return {
    name: "engine-local",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (importer === undefined || !/default-registry(\.js)?$/.test(source)) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (resolved === null || !DEFAULT_REGISTRY.test(resolved.id)) return null;
      return resolved.id.replace(/default-registry\.(js|ts)$/, "default-registry.browser.$1");
    },
  };
}
