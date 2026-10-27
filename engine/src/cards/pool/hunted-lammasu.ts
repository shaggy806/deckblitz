import { defineCard } from "../define.js";

const TEXT = "When this creature enters, target opponent creates a 4/4 black Horror creature token.";

export default defineCard({
  name: "Hunted Lammasu",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Lammasu"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "create-token", token: "Horror Token (4/4)", count: 1, who: "target-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
