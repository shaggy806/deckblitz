import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 31896.
//
// Vertigo's effect as an activated ability.

const TEXT =
  "{1}{R}{R}: This creature deals 2 damage to target creature with flying and that creature loses flying until end of turn.";

export default defineCard({
  name: "Burning Palm Efreet",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}{R}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "lose-keywords", target: 0, keywords: ["flying"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
