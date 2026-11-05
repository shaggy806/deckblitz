import { defineCard } from "../define.js";

// EDHREC rank 24779.

export default defineCard({
  name: "Flaying Tendrils",
  manaCost: "{1}{B}{B}",
  colors: [],
  types: ["sorcery"],
  text: "Devoid (This card has no color.)\nAll creatures get -2/-2 until end of turn. If a creature would die this turn, exile it instead.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -2,
        toughness: -2,
        duration: "end-of-turn",
      },
      {
        kind: "player-effect",
        duration: "end-of-turn",
        graveyardExile: { filter: { type: "creature" }, from: "battlefield" },
      },
    ],
  },
});
