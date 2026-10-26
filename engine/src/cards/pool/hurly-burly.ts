import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 26610. "Choose one —": the mode is chosen as
// it's cast (rule 700.2a), so `castModal`, targets or not.
export default defineCard({
  name: "Hurly-Burly",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one —\n• Hurly-Burly deals 1 damage to each creature without flying.\n• Hurly-Burly deals 1 damage to each creature with flying.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Hurly-Burly deals 1 damage to each creature without flying.",
        effect: { kind: "damage-all", amount: 1, filter: { type: "creature", notKeyword: "flying" } },
      },
      {
        text: "Hurly-Burly deals 1 damage to each creature with flying.",
        effect: { kind: "damage-all", amount: 1, filter: { type: "creature", keyword: "flying" } },
      },
    ],
  },
});
