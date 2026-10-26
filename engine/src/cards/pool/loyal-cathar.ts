import { defineCard } from "../define.js";

// EDHREC rank 30529. Front face of Loyal Cathar // Unhallowed Cathar.
// Resurrection Orb's delayed return, with Harvest Hand's "transformed under
// your control": it enters back face up rather than entering and then
// transforming (its ruling).

const DIES_TEXT =
  "When this creature dies, return it to the battlefield transformed under your control at the beginning of the next end step.";

export default defineCard({
  name: "Loyal Cathar",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "put-onto-battlefield", target: "trigger-object", transformed: true, underYourControl: true },
        text: "Return Loyal Cathar to the battlefield transformed under your control.",
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Loyal Cathar", "Unhallowed Cathar"],
  transform: true,
});
