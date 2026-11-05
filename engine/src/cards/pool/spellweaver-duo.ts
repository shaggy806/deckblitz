import { defineCard } from "../define.js";

// EDHREC rank 31003.

export default defineCard({
  name: "Spellweaver Duo",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 4,
  assist: true,
  text: "Assist (Another player can pay up to {6} of this spell's cost.)\nWhen this creature enters, you may return target tapped creature to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Return target tapped creature to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: "When this creature enters, you may return target tapped creature to its owner's hand.",
    },
  ],
});
