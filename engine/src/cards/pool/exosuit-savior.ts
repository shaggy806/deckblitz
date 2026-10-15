import { defineCard } from "../define.js";

const TEXT = "When this creature enters, return up to one other target permanent you control to its owner's hand.";

export default defineCard({
  name: "Exosuit Savior",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: { kind: "permanent", whose: "you", filter: {} } } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
