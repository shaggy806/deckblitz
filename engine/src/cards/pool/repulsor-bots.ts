import { defineCard } from "../define.js";

// EDHREC rank 22154.
// Marang River Regent's two optional "other" slots, over artifacts and/or
// creatures (Baral's Expertise's filter), returned together.

const ETB_TEXT =
  "When this creature enters, return up to two other target artifacts and/or creatures to their owners' hands.";
const ARTIFACT_OR_CREATURE = { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } } as const;

export default defineCard({
  name: "Repulsor Bots",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "other", of: ARTIFACT_OR_CREATURE } },
        { kind: "optional", of: { kind: "other", of: { kind: "other", of: ARTIFACT_OR_CREATURE }, than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
