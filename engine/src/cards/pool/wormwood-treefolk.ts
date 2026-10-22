import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 31910.
//
// Rulings:
//   [2004-10-04] Causing Wormwood Treefolk to gain forestwalk or swampwalk is useful only during
//     the declare attackers step or earlier. Once it becomes blocked, giving it a landwalk ability
//     won't change that.

const FOREST =
  "{G}{G}: This creature gains forestwalk until end of turn and deals 2 damage to you. (It can't be blocked as long as defending player controls a Forest.)";
const SWAMP =
  "{B}{B}: This creature gains swampwalk until end of turn and deals 2 damage to you. (It can't be blocked as long as defending player controls a Swamp.)";

export default defineCard({
  name: "Wormwood Treefolk",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 4,
  toughness: 4,
  text: `${FOREST}\n${SWAMP}`,
  activated: [
    {
      cost: { mana: "{G}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "forestwalk", duration: "end-of-turn" },
          { kind: "damage", amount: 2, who: "you" },
        ],
      },
      resolve: null,
      text: FOREST,
    },
    {
      cost: { mana: "{B}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "swampwalk", duration: "end-of-turn" },
          { kind: "damage", amount: 2, who: "you" },
        ],
      },
      resolve: null,
      text: SWAMP,
    },
  ],
});
