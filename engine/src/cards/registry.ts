/** `CardRegistry` — resolves a card name to its printed definition — and the
 * default one, which knows every built-in card. */

import { CardRegistry } from "./card-registry.js";
import { BUILTIN_CARDS } from "./generated.js";
import { registryFrom } from "./registry-from.js";

export { CardRegistry };
export { registryFrom };

export function createDefaultRegistry(): CardRegistry {
  return registryFrom(BUILTIN_CARDS);
}
