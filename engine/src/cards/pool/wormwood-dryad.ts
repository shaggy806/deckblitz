import { defineCard } from "../define.js";

// Time Spiral. EDHREC rank 32097. Wormwood Treefolk's shape.

const FOREST_TEXT =
  "{G}: This creature gains forestwalk until end of turn and deals 1 damage to you. (It can't be blocked as long as defending player controls a Forest.)";
const SWAMP_TEXT =
  "{B}: This creature gains swampwalk until end of turn and deals 1 damage to you. (It can't be blocked as long as defending player controls a Swamp.)";

export default defineCard({
  name: "Wormwood Dryad",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 3,
  toughness: 1,
  text: `${FOREST_TEXT}\n${SWAMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "forestwalk", duration: "end-of-turn" },
          { kind: "damage", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: FOREST_TEXT,
    },
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "swampwalk", duration: "end-of-turn" },
          { kind: "damage", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: SWAMP_TEXT,
    },
  ],
});
