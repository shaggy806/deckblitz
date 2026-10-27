import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 32049. Any player's black spell, its own
// controller's included.

const TEXT = "Whenever a player casts a black spell, this creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Bog Gnarr",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["B"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
