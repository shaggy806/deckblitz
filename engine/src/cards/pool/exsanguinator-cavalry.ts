import { defineCard } from "../define.js";

// EDHREC rank 6812.
// Makes Blood → "Blood Token".
//
// Each Knight you control that deals combat damage to a player triggers it
// once; the counter goes on that Knight (`trigger-object`), and a Blood token
// is made either way.

const TEXT =
  "Whenever a Knight you control deals combat damage to a player, put a +1/+1 counter on that creature and create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Exsanguinator Cavalry",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 2,
  toughness: 3,
  keywords: ["menace", "lifelink"],
  text: `Menace, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { type: "creature", subtype: "Knight" },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          { kind: "create-token", token: "Blood Token", count: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
