import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 25432.
//
// The target is mandatory (even your own creature, the ruling); the damage is optional, and the
// artifacts are counted as it resolves.
const TEXT =
  "When this creature enters, you may have it deal damage to target creature equal to the number of artifacts you control.";

export default defineCard({
  name: "Reclusive Artificer",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste (This creature can attack and {T} as soon as it comes under your control.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Reclusive Artificer deal damage to the target equal to the number of artifacts you control?",
        effect: { kind: "damage", amount: { countOf: { type: "artifact", controlledBy: "you" } }, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
