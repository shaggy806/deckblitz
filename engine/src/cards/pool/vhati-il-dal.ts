import { defineCard } from "../define.js";

// EDHREC rank 17940.
//
// Rulings:
//   [2004-10-04] You don't choose whether to affect the targeted creature's power or its toughness
//     until the ability resolves.
//
// The choice is made as it resolves (a `modal` that isn't `announced`), and
// sets one base value alone, the other unchanged (`animate`, rule 613.4b).
const TEXT = "{T}: Until end of turn, target creature has base power 1 or base toughness 1.";

export default defineCard({
  name: "Vhati il-Dal",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Base power 1",
            effect: { kind: "animate", target: 0, power: 1, addTypes: [], addSubtypes: [], duration: "end-of-turn" },
          },
          {
            text: "Base toughness 1",
            effect: { kind: "animate", target: 0, toughness: 1, addTypes: [], addSubtypes: [], duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
