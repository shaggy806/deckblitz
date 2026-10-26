import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 24276. Shadowmoor.
//
// Rulings:
//   [2008-05-01] The -1/-1 counter is put on Wicker Warcrawler at end of combat, after combat
//     damage has already been dealt. (Note that this is different from how Dusk Urchins works.)
//
// Dorothea, Vengeful Victim's shape: a trigger per event, each setting up a delayed trigger at
// end of combat that puts the counter on this permanent.

const TEXT = "Whenever this creature attacks or blocks, put a -1/-1 counter on it at end of combat.";

const counterAtEndOfCombat = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "end-of-combat",
    effect: { kind: "add-counter", target: "source", counter: "-1/-1", amount: 1 },
    text: "Put a -1/-1 counter on Wicker Warcrawler.",
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Wicker Warcrawler",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [counterAtEndOfCombat("attacks"), counterAtEndOfCombat("blocks")],
});
