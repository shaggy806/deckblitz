import { defineCard } from "../define.js";

// EDHREC rank 26939.

const ENTERS_TEXT = "When this creature enters, remove target attacking or blocking creature from combat.";

export default defineCard({
  name: "Hollowhenge Spirit",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nFlying\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "remove-from-combat", target: 0 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
