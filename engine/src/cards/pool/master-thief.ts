import { defineCard } from "../define.js";

const TEXT = "When this creature enters, gain control of target artifact for as long as you control this creature.";

export default defineCard({
  name: "Master Thief",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["artifact"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
