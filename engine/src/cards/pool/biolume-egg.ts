import { defineCard } from "../define.js";

// Loyal Cathar's delayed return, under its owner's control (no
// `underYourControl`). A card that isn't double-faced can't enter
// transformed and stays put (the ruling, rule 712.14).
const ENTER_TEXT = "When this creature enters, scry 2.";
const SAC_TEXT =
  "When you sacrifice this creature, return it to the battlefield transformed under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Biolume Egg",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent", "Egg"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${ENTER_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", selfOnly: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "put-onto-battlefield", target: "trigger-object", transformed: true },
        text: "Return Biolume Egg to the battlefield transformed under its owner's control.",
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  faces: ["Biolume Egg", "Biolume Serpent"],
  transform: true,
});
