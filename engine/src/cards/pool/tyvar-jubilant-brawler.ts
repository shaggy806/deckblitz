import { defineCard } from "../define.js";

// The −2 may return any creature card with mana value 2 or less from the
// graveyard, not only one just milled (the ruling).

const HASTE_TEXT = "You may activate abilities of creatures you control as though those creatures had haste.";
const PLUS_TEXT = "+1: Untap up to one target creature.";
const MINUS_TEXT =
  "−2: Mill three cards, then you may return a creature card with mana value 2 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Tyvar, Jubilant Brawler",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tyvar"],
  loyalty: 3,
  text: `${HASTE_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "creature", manaValue: { op: "lte", n: 2 } },
          },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, activateAsThoughHaste: { type: "creature" }, text: HASTE_TEXT }],
});
