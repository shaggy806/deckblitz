import { defineCard } from "../define.js";

// EDHREC rank 16628.
//
// Rulings: a land that's already a creature gets base 0/0, its counters and
// other modifications still applying; the animation lasts indefinitely.

const TEXT =
  "{X}{G}{G}: Put X +1/+1 counters on target land you control. That land becomes a 0/0 Elemental creature with haste. It's still a land.";

export default defineCard({
  name: "Waker of the Wilds",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Shaman"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{G}{G}", tap: false },
      targets: ["land-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
          {
            kind: "animate",
            target: 0,
            power: 0,
            toughness: 0,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            keywords: ["haste"],
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
