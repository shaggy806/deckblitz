import { defineCard } from "../define.js";

const PLAIN = "{T}: Add {C}.";
const CHARGE = "{1}, {T}: Put a charge counter on this land.";
const SPEND = "Spend this mana only to cast kicked spells.";
const KICKED = `{T}, Remove a charge counter from this land: Add two mana of any one color. ${SPEND}`;

export default defineCard({
  name: "Throne of Makindi",
  types: ["land"],
  text: `${PLAIN}\n${CHARGE}\n${KICKED}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: PLAIN,
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE,
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 2,
        spendOnly: { purposes: ["kicked-spell"], text: SPEND },
      },
      resolve: null,
      text: KICKED,
    },
  ],
});
