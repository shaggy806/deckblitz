import { defineCard } from "../define.js";

// Magic 2013 (M13). EDHREC rank 20455.
const CAST = "Whenever you cast a red spell, target creature can't block this turn.";

export default defineCard({
  name: "Goblin Battle Jester",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: CAST,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: CAST,
    },
  ],
});
