import { defineCard } from "../define.js";

// EDHREC rank 28541.
const TEXT = "Whenever you cast a colorless spell, this creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Sky Scourer",
  manaCost: "{1}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Devoid (This card has no color.)\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colorless: true } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
