import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 31884. Any player's blue spell, its own
// controller's included.

const TEXT = "Whenever a player casts a blue spell, this creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Glade Gnarr",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["U"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
