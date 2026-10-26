import { defineCard } from "../define.js";

const ETB_TEXT = "When this creature enters, untap another target creature you control.";

export default defineCard({
  name: "Breaching Hippocamp",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Horse", "Fish"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
