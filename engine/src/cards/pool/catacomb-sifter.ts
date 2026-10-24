import { defineCard } from "../define.js";

// EDHREC rank 9378.
const ETB =
  "When this creature enters, create a 1/1 colorless Eldrazi Scion creature token. It has \"Sacrifice this token: Add {C}.\"";
const DIES = "Whenever another creature you control dies, scry 1.";

export default defineCard({
  name: "Catacomb Sifter",
  manaCost: "{1}{B}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 3,
  text: `Devoid (This card has no color.)\n${ETB}\n${DIES} (Look at the top card of your library. You may put that card on the bottom.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 1 },
      resolve: null,
      text: ETB,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: DIES,
    },
  ],
});
