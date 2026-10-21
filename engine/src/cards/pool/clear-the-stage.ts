import { defineCard } from "../define.js";

export default defineCard({
  name: "Clear the Stage",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -3/-3 until end of turn. If you control a creature with power 4 or greater, you may return up to one target creature card from your graveyard to your hand.",
  targets: [
    "creature",
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Return the targeted creature card from your graveyard to your hand?",
          effect: { kind: "return-to-hand", target: 1, from: "graveyard" },
        },
      },
    ],
  },
});
