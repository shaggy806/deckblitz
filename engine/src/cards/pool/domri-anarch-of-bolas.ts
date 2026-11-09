import { defineCard } from "../define.js";

// EDHREC rank 2766. The +1 uses the stack (a loyalty ability, rule 605.1a) and
// then "creature spells you cast this turn can't be countered" reaches every
// creature spell cast later that turn (the ruling).

const STATIC_TEXT = "Creatures you control get +1/+0.";
const PLUS_TEXT = "+1: Add {R} or {G}. Creature spells you cast this turn can't be countered.";
const MINUS_TEXT = "−2: Target creature you control fights target creature you don't control.";

export default defineCard({
  name: "Domri, Anarch of Bolas",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Domri"],
  loyalty: 3,
  text: `${STATIC_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}`,
  static: [{ affects: { scope: "creatures-you-control" }, grantPt: [1, 0], text: STATIC_TEXT }],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 1 },
          { kind: "grant-spells-this-turn", filter: { type: "creature" }, cantBeCountered: true },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature-you-control", "creature-an-opponent-controls"],
      effect: { kind: "fight", a: 0, b: 1 },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
});
