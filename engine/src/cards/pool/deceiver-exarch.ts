import { defineCard } from "../define.js";

export default defineCard({
  name: "Deceiver Exarch",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 1,
  toughness: 4,
  keywords: ["flash"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\nWhen this creature enters, choose one —\n• Untap target permanent you control.\n• Tap target permanent an opponent controls.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Untap target permanent you control.",
            targets: [{ kind: "permanent", whose: "you", filter: {} }],
            effect: { kind: "untap", target: 0 },
          },
          {
            text: "Tap target permanent an opponent controls.",
            targets: [{ kind: "permanent", whose: "opponent", filter: {} }],
            effect: { kind: "tap", target: 0 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
