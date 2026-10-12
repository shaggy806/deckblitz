import { defineCard } from "../define.js";

export default defineCard({
  name: "Mysterious Tome",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Book"],
  text: "{2}, {T}: Draw a card. Transform this artifact.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "transform", target: "source" }],
      },
      resolve: null,
      text: "{2}, {T}: Draw a card. Transform this artifact.",
    },
  ],
  faces: ["Mysterious Tome", "Chilling Chronicle"],
  transform: true,
});
