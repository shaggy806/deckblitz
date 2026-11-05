import { defineCard } from "../define.js";

const TAX = "Spells your opponents cast that target a creature or planeswalker you control cost {2} more to cast.";
const MINUS = "−2: Create a 2/2 blue Wizard creature token. Draw a card, then discard a card.";

export default defineCard({
  name: "Kasmina, Enigmatic Mentor",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kasmina"],
  loyalty: 5,
  text: `${TAX}\n${MINUS}`,
  static: [
    {
      affects: { scope: "self" },
      // {2} once per spell, however many of your permanents it targets (the ruling).
      targetedBySpellsCost: {
        payGeneric: 2,
        targeting: { typesAnyOf: ["creature", "planeswalker"], controlledBy: "you" },
      },
      text: TAX,
    },
  ],
  activated: [
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Wizard Token", count: 1 },
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: MINUS,
    },
  ],
});
