import { defineCard } from "../define.js";

export default defineCard({
  name: "Peppersmoke",
  manaCost: "{B}",
  colors: ["B"],
  types: ["kindred", "instant"],
  subtypes: ["Faerie"],
  text: "Target creature gets -1/-1 until end of turn. If you control a Faerie, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Faerie" }, atLeast: 1 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
