import { defineCard } from "../define.js";

// EDHREC rank 28193.
const TEXT = "Whenever you cast a colorless spell, this creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Kozilek's Sentinel",
  manaCost: "{1}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 1,
  toughness: 4,
  text: `Devoid (This card has no color.)\n${TEXT}`,
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
