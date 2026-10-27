import { defineCard } from "../define.js";

// EDHREC rank 21122.
//
// Rulings:
//   It can regenerate itself.

const TEXT = "{1}{B}: Regenerate target Zombie.";

export default defineCard({
  name: "Boneknitter",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cleric"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{2}{B}" },
  text: `${TEXT}\nMorph {2}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Zombie" } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
