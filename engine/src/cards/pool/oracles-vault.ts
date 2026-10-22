import { defineCard } from "../define.js";

// EDHREC rank 13269. Amonkhet. The first ability adds its brick counter
// whether or not the card is played (the ruling); the second is Mind's
// Desire's free impulse, gated on three bricks. A free card's {X} is 0, and a
// land is still played only with a land play left (the rulings).
const FIRST =
  "{2}, {T}: Exile the top card of your library. Until end of turn, you may play that card. Put a brick counter on this artifact.";
const SECOND =
  "{T}: Exile the top card of your library. Until end of turn, you may play that card without paying its mana cost. Activate only if there are three or more brick counters on this artifact.";

export default defineCard({
  name: "Oracle's Vault",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${FIRST}\n${SECOND}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
          { kind: "add-counter", target: "source", counter: "brick", amount: 1 },
        ],
      },
      resolve: null,
      text: FIRST,
    },
    {
      cost: { mana: null, tap: true },
      condition: { kind: "self-counters", counter: "brick", compare: { op: "gte", n: 3 } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", free: { only: true } },
      resolve: null,
      text: SECOND,
    },
  ],
});
