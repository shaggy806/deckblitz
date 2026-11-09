import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

const evenFrom = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { manaValueParity: "even" } },
});

export default defineCard({
  name: "Desecrate Reality",
  manaCost: "{7}",
  colors: [],
  types: ["instant"],
  text: "For each opponent, exile up to one target permanent that player controls with an even mana value. (Zero is even.)\nAdamant — If at least three colorless mana was spent to cast this spell, return a permanent card with an odd mana value from your graveyard to the battlefield.",
  targets: [evenFrom(1), evenFrom(2), evenFrom(3)],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0 },
          { kind: "exile", target: 1 },
          { kind: "exile", target: 2 },
        ],
      },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpent: [{ type: "C", amount: { op: "gte", n: 3 } }] } },
        then: {
          kind: "return-from-graveyard",
          filter: { notTypes: ["instant", "sorcery"], manaValueParity: "odd" },
          destination: "battlefield",
          count: 1,
        },
      },
    ],
  },
});
