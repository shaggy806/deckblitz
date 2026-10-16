import { defineCard } from "../define.js";

// EDHREC rank 18891.

export default defineCard({
  name: "Spring Splasher",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Frog", "Beast"],
  power: 2,
  toughness: 1,
  text: "Whenever this creature attacks, target creature defending player controls gets -3/-0 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, target creature defending player controls gets -3/-0 until end of turn.",
    },
  ],
});
