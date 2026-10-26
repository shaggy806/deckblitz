import { defineCard } from "../define.js";

const DIES_TEXT = "When this creature dies, create a 3/3 white Bird creature token with flying.";

export default defineCard({
  name: "Roc Egg",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Egg"],
  power: 0,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "3/3 White Bird Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
