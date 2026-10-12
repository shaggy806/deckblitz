import { defineCard } from "../define.js";

export default defineCard({
  name: "Uncomfortable Chill",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Creatures your opponents control get -2/-0 until end of turn.\nDraw a card.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -2,
        toughness: 0,
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
