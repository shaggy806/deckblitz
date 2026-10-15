import { defineCard } from "../define.js";

const TEXT = "When this creature enters or dies, surveil 1.";

export default defineCard({
  name: "Thawbringer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Scout"],
  power: 4,
  toughness: 2,
  text: `${TEXT} (Look at the top card of your library. You may put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
