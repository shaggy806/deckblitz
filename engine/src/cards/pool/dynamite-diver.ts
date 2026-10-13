import { defineCard } from "../define.js";

// EDHREC rank 13327.
//
// Rulings:
//   [2025-02-07] Saddling a Mount or crewing a Vehicle doesn't cause this creature's power to
//     change.
const PILOT_TEXT = "This creature saddles Mounts and crews Vehicles as though its power were 2 greater.";
const DIES_TEXT = "When this creature dies, it deals 1 damage to any target.";

export default defineCard({
  name: "Dynamite Diver",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Pilot"],
  power: 1,
  toughness: 1,
  text: `${PILOT_TEXT}\n${DIES_TEXT}`,
  static: [{ affects: { scope: "self" }, crewsAs: { plus: 2, saddles: true }, text: PILOT_TEXT }],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
