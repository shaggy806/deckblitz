import { defineCard } from "../define.js";

// +2's four slots are each optional (its ruling: any of them, or none). They
// are two instances of "target", so a land creature may be one of the
// creatures and one of the lands. −10's finds enter at the same time (its
// ruling) — one look-and-choose move.
const PLUS_TEXT = "+2: Untap up to two target creatures and up to two target lands.";
const MINUS_TEXT = "−3: Target creature gets +5/+5 until end of turn.";
const ULT_TEXT =
  "−10: Look at the top ten cards of your library. You may put any number of creature and/or land cards from among them onto the battlefield. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Nissa, Genesis Mage",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nissa"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
        { kind: "optional", of: "land" },
        { kind: "optional", of: { kind: "other", of: "land", than: { slot: 2 } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "untap", target: 0 },
          { kind: "untap", target: 1 },
          { kind: "untap", target: 2 },
          { kind: "untap", target: 3 },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 5, toughness: 5, duration: "end-of-turn" },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 10,
        min: 0,
        max: 10,
        filter: { typesAnyOf: ["creature", "land"] },
        destination: "battlefield",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
