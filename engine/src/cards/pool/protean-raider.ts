import { defineCard } from "../define.js";

// Raid looks at the whole turn (its ruling): whether the attacker is still
// around doesn't matter. Unmet, it's asked nothing and is a 2/2 as itself.
export default defineCard({
  name: "Protean Raider",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Shapeshifter", "Pirate"],
  power: 2,
  toughness: 2,
  text: "Raid — If you attacked this turn, you may have this creature enter as a copy of any creature on the battlefield.",
  copyOnEnter: {
    filter: { type: "creature" },
    condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
  },
});
