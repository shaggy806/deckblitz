import { defineCard } from "../define.js";

// EDHREC rank 11070.
const DIES =
  "When this creature dies, create a 1/1 colorless Eldrazi Scion creature token. It has \"Sacrifice this token: Add {C}.\"";

export default defineCard({
  name: "Blisterpod",
  manaCost: "{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 1,
  toughness: 1,
  text: `Devoid (This card has no color.)\n${DIES}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 1 },
      resolve: null,
      text: DIES,
    },
  ],
});
