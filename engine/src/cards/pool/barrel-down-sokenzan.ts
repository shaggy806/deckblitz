import { defineCard } from "../define.js";

// EDHREC rank 23647.
//
// Rulings:
//   [2005-06-01] The lands are returned on resolution; this is not a cost of casting the spell.
//
// Sweep: any number of Mountains chosen on resolution (not targets), then
// the damage counts the Mountains actually returned this way, twice.
const TEXT =
  "Sweep — Return any number of Mountains you control to their owner's hand. Barrel Down Sokenzan deals damage to target creature equal to twice the number of Mountains returned this way.";

export default defineCard({
  name: "Barrel Down Sokenzan",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: { subtype: "Mountain", controlledBy: "you" },
        min: 0,
        upTo: { countOf: { subtype: "Mountain", controlledBy: "you" } },
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return any number of Mountains you control to their owner's hand",
      },
      {
        kind: "damage",
        target: 0,
        amount: { product: [{ thisWay: "returned-to-hand", filter: { subtype: "Mountain" } }, 2] },
      },
    ],
  },
});
