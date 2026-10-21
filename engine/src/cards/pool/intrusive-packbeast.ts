import { defineCard } from "../define.js";

// EDHREC rank 30075.

export default defineCard({
  name: "Intrusive Packbeast",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen this creature enters, tap up to two target creatures your opponents control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "creature-an-opponent-controls" },
        { kind: "optional", of: { kind: "other", of: "creature-an-opponent-controls", than: { slot: 0 } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
        ],
      },
      resolve: null,
      text: "When this creature enters, tap up to two target creatures your opponents control.",
    },
  ],
});
