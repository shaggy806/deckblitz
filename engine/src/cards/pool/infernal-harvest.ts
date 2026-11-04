import { defineCard } from "../define.js";

// X is announced as it's cast and capped by the Swamps there are (rule 601.2b, 118.3); the
// Swamps go back as the cost is paid, so ones tapped for its own {1}{B} may be among them
// (601.2h). Divided at cast, at least 1 to each target (rule 601.2d) — so no more targets than X,
// none at X = 0. Not an {X} in its mana cost: its mana value stays 2.

export default defineCard({
  name: "Infernal Harvest",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, return X Swamps you control to their owner's hand.\nInfernal Harvest deals X damage divided as you choose among any number of target creatures.",
  additionalCost: { returnToHandX: { type: "land", subtype: "Swamp" } },
  targets: [{ kind: "any-number", of: "creature", max: "x" }],
  divided: { total: 0, slot: 0, x: true },
  effect: { kind: "damage-divided", from: 0 },
});
