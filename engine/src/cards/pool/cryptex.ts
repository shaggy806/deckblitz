import { defineCard } from "../define.js";

// Rulings:
//   [2024-02-02] Cryptex's first ability is a mana ability. It doesn't use the stack and can't be
//     responded to.
//   [2024-02-02] If you can't exile enough cards to meet or exceed the required mana value, you can't
//     choose to collect evidence at all.
const MANA = "{T}, Collect evidence 3: Add one mana of any color. Put an unlock counter on this artifact.";
const CRACK = "Sacrifice this artifact: Surveil 3, then draw three cards. Activate only if this artifact has five or more unlock counters on it.";

export default defineCard({
  name: "Cryptex",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${MANA} (To collect evidence 3, exile cards with total mana value 3 or greater from your graveyard.)\n${CRACK}`,
  activated: [
    {
      cost: { mana: null, tap: true, collectEvidence: 3 },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: { kind: "add-counter", target: "source", counter: "unlock", amount: 1 },
      },
      resolve: null,
      text: MANA,
    },
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      condition: { kind: "self-counters", counter: "unlock", compare: { op: "gte", n: 5 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "surveil", amount: 3 },
          { kind: "draw", amount: 3 },
        ],
      },
      resolve: null,
      text: CRACK,
    },
  ],
});
