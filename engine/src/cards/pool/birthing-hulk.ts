import { defineCard } from "../define.js";

// EDHREC rank 16359.
// Makes Eldrazi Scion → "Eldrazi Scion Token".

const ETB_TEXT =
  "When this creature enters, create two 1/1 colorless Eldrazi Scion creature tokens. They have \"Sacrifice this token: Add {C}.\"";

export default defineCard({
  name: "Birthing Hulk",
  manaCost: "{6}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 5,
  toughness: 4,
  text: `Devoid (This card has no color.)\n${ETB_TEXT} ({C} represents colorless mana.)\n{1}{C}: Regenerate this creature.`,
  activated: [
    {
      cost: { mana: "{1}{C}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{C}: Regenerate this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 2 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
