import { defineCard } from "../define.js";

const ENTER_TEXT =
  'When this creature enters, each opponent creates a 1/1 red Pirate creature token with "This token can\'t block" and "Creatures you control attack each combat if able."';
const TAX_TEXT = "Spells your opponents cast that target this creature cost {3} more to cast.";

export default defineCard({
  name: "Pursued Whale",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Whale"],
  power: 8,
  toughness: 8,
  text: `${ENTER_TEXT}\n${TAX_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Pirate Token (Can't Block, Creatures Attack)",
        count: 1,
        who: "each-opponent",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, targetedBySpellsCost: { payGeneric: 3 }, text: TAX_TEXT }],
});
