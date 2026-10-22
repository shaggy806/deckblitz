import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 31523.

export default defineCard({
  name: "Vertigo",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Vertigo deals 2 damage to target creature with flying. That creature loses flying until end of turn.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "lose-keywords", target: 0, keywords: ["flying"], duration: "end-of-turn" },
    ],
  },
});
