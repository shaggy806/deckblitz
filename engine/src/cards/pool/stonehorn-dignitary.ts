import { defineCard } from "../define.js";

const TEXT = "When this creature enters, target opponent skips their next combat phase.";

export default defineCard({
  name: "Stonehorn Dignitary",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rhino", "Soldier"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "skip-step", step: "combat", who: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
