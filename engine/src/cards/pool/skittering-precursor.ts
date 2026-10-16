import { defineCard } from "../define.js";

// EDHREC rank 10106. Any nontoken permanent you sacrifice, not only a creature.
const TEXT =
  'Whenever you sacrifice a nontoken permanent, create a 0/1 colorless Eldrazi Spawn creature token with "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Skittering Precursor",
  manaCost: "{2}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Devoid (This card has no color.)\nMenace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { token: false } },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
