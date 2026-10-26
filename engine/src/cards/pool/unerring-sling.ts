import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 31500.
//
// `powerOf: "tapped"` is the creature tapped to pay the cost, read as the
// ability resolves (as it last existed, if it has left).

const TEXT =
  "{3}, {T}, Tap an untapped creature you control: This artifact deals damage equal to the tapped creature's power to target attacking or blocking creature with flying.";

export default defineCard({
  name: "Unerring Sling",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{3}",
        tap: true,
        tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" } },
      },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", keyword: "flying", anyOf: [{ attacking: true }, { blocking: true }] },
        },
      ],
      effect: { kind: "damage", amount: { powerOf: "tapped" }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
