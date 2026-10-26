import { defineCard } from "../define.js";

const DIES_TEXT = "When this creature dies, create a 2/4 black Spider creature token with reach.";

export default defineCard({
  name: "Penumbra Spider",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "2/4 Black Spider Token (Reach)", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
