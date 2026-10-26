import { defineCard } from "../define.js";

// EDHREC rank 29097. The toughness check reads the creature after its
// counter; the shield lasts the turn or until used (the rulings).
const TEXT =
  "Sacrifice this creature: Put a -1/-1 counter on target creature. Then if that creature's toughness is 1 or greater, regenerate it.";

export default defineCard({
  name: "Gore Vassal",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Dog"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { toughness: { op: "gte", n: 1 } } },
            then: { kind: "regenerate", target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
