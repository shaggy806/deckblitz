import type { ReplacementSpec } from "../../replacements.js";
import { defineCard } from "../define.js";

// A replacement, not a "can't" (Sulfuric Vortex's words): the gain is still
// attempted, so an exchange of life totals happens (rule 119.7).
const NO_LIFE: ReplacementSpec = { event: "would-gain-life", who: "any-player", prevent: true, gainsNoLifeInstead: true };

// EDHREC rank 25406.
export default defineCard({
  name: "Flames of the Blood Hand",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Flames of the Blood Hand deals 4 damage to target player or planeswalker. The damage can't be prevented. If that player or that planeswalker's controller would gain life this turn, that player gains no life instead.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0, cantBePrevented: true },
      // One of these names nobody: the target is a player or a planeswalker.
      { kind: "replacement-effect", replacement: NO_LIFE, duration: "end-of-turn", players: { target: 0 } },
      { kind: "replacement-effect", replacement: NO_LIFE, duration: "end-of-turn", players: { controllerOf: 0 } },
    ],
  },
});
