import { defineCard } from "../define.js";

export default defineCard({
  name: "Black Sun's Twilight",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Up to one target creature gets -X/-X until end of turn. If X is 5 or more, return a creature card with mana value X or less from your graveyard to the battlefield tapped.",
  targets: [{ kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt",
        target: 0,
        power: { product: ["x", -1] },
        toughness: { product: ["x", -1] },
        duration: "end-of-turn",
      },
      {
        kind: "conditional",
        condition: { kind: "x", compare: { op: "gte", n: 5 } },
        // Not a target: chosen as the spell resolves (the ruling).
        then: {
          kind: "return-from-graveyard",
          filter: { type: "creature", manaValue: { op: "lte", n: { amount: "x" } } },
          destination: "battlefield",
          count: 1,
          enterTapped: true,
        },
      },
    ],
  },
});
