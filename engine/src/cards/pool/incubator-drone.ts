import { defineCard } from "../define.js";

// EDHREC rank 20839.
const ETB =
  "When this creature enters, create a 1/1 colorless Eldrazi Scion creature token. It has \"Sacrifice this token: Add {C}.\"";

export default defineCard({
  name: "Incubator Drone",
  manaCost: "{3}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 3,
  text: `Devoid (This card has no color.)\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 1 },
      resolve: null,
      text: ETB,
    },
  ],
});
