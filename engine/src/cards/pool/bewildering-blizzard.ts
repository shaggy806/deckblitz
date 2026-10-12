import { defineCard } from "../define.js";

export default defineCard({
  name: "Bewildering Blizzard",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw three cards. Creatures your opponents control get -3/-0 until end of turn.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -3,
        toughness: 0,
        duration: "end-of-turn",
      },
    ],
  },
});
