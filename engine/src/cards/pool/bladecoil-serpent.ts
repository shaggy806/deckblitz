import { defineCard } from "../define.js";

const DRAW_TEXT = "When this creature enters, for each {U}{U} spent to cast it, draw a card.";
const DISCARD_TEXT = "When this creature enters, for each {B}{B} spent to cast it, each opponent discards a card.";
const RED_TEXT = "When this creature enters, for each {R}{R} spent to cast it, it gets +1/+0 and gains trample and haste until end of turn.";
const pairsOf = (type: "U" | "B" | "R") => ({ manaSpentOf: "source", type, per: 2 }) as const;

// EDHREC rank 25403. Whole pairs of the mana spent (`manaSpentOf`'s `per`):
// three {U} is one {U}{U}.
export default defineCard({
  name: "Bladecoil Serpent",
  manaCost: "{X}{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Serpent"],
  power: 5,
  toughness: 4,
  text: `${DRAW_TEXT}\n${DISCARD_TEXT}\n${RED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: pairsOf("U") },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: pairsOf("B") },
      resolve: null,
      text: DISCARD_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "amounts", left: pairsOf("R"), op: "gte", right: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: pairsOf("R"), toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: RED_TEXT,
    },
  ],
});
