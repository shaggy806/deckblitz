import { defineCard } from "../define.js";

export default defineCard({
  name: "Surge of Thoughtweft",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["kindred", "instant"],
  subtypes: ["Kithkin"],
  text: "Creatures you control get +1/+1 until end of turn. If you control a Kithkin, draw a card.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 1, toughness: 1, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Kithkin" }, atLeast: 1 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
