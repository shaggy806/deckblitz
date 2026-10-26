import { defineCard } from "../define.js";

// EDHREC rank 32207.

const TEXT = "Whenever this creature becomes the target of a spell or ability, you lose 1 life.";

export default defineCard({
  name: "Tethered Skirge",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Imp"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "you" },
      resolve: null,
      text: TEXT,
    },
  ],
});
