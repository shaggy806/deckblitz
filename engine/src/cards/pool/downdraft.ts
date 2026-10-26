import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 28243.
//
// "It deals 2 damage": the sacrificed enchantment is the source, as it last
// existed (rule 608.2h).

const LOSE_TEXT = "{G}: Target creature loses flying until end of turn.";
const SAC_TEXT = "Sacrifice this enchantment: It deals 2 damage to each creature with flying.";

export default defineCard({
  name: "Downdraft",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${LOSE_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "lose-keywords", target: 0, keywords: ["flying"], duration: "end-of-turn" },
      resolve: null,
      text: LOSE_TEXT,
    },
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "damage-all", amount: 2, filter: { type: "creature", keyword: "flying" } },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
