import { defineCard } from "../define.js";

// EDHREC rank 8569.
// Makes Scarecrow → "Scarecrow Token".
//
// Rulings:
//   The value of X is calculated only once, as Wickersmith's Tools's last ability resolves.
//
// "One or more -1/-1 counters are put on a creature" is any creature, anyone's
// — once per creature per event (Shalai and Hallar's trigger). X reads the
// Tools as they last existed, since sacrificing them is part of the cost (rule
// 608.2h).

const CHARGE_TEXT =
  "Whenever one or more -1/-1 counters are put on a creature, put a charge counter on this artifact.";
const MANA_TEXT = "{T}: Add one mana of any color.";
const TOKEN_TEXT =
  "{5}, {T}, Sacrifice this artifact: Create X tapped 2/2 colorless Scarecrow artifact creature tokens, where X is the number of charge counters on this artifact.";

export default defineCard({
  name: "Wickersmith's Tools",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${CHARGE_TEXT}\n${MANA_TEXT}\n${TOKEN_TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-put", who: "any", counter: "-1/-1", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{5}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Scarecrow Token",
        count: { countersOn: "source", counter: "charge" },
        tapped: true,
      },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
