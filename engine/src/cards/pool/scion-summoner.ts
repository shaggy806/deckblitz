import { defineCard } from "../define.js";

// EDHREC rank 15671.
// Makes Eldrazi Scion → "Eldrazi Scion Token".

const ETB_TEXT =
  "When this creature enters, create a 1/1 colorless Eldrazi Scion creature token. It has \"Sacrifice this token: Add {C}.\"";

export default defineCard({
  name: "Scion Summoner",
  manaCost: "{2}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 2,
  text: `Devoid (This card has no color.)\n${ETB_TEXT} ({C} represents colorless mana.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
