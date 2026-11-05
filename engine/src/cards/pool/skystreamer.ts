import { defineCard } from "../define.js";

const TEXT = "When this creature enters, target player gains 4 life.";

export default defineCard({
  name: "Skystreamer",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  assist: true,
  text: `Assist (Another player can pay up to {4} of this spell's cost.)\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "gain-life", amount: 4, toControllerOfTarget: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
