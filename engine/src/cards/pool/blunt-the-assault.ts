import { defineCard } from "../define.js";

// Every creature on the battlefield counts, not just those in combat (the
// ruling) — Fog of War's shape without its power limit.
export default defineCard({
  name: "Blunt the Assault",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "You gain 1 life for each creature on the battlefield. Prevent all combat damage that would be dealt this turn.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: { countOf: { type: "creature" } } },
      { kind: "prevent-all-combat-damage" },
    ],
  },
});
