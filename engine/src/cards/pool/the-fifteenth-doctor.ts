import { defineCard } from "../define.js";

// EDHREC rank 16254. Improvise reaches only the first nonartifact spell its
// controller casts each turn (`firstEachTurn`, counting spells cast before
// the Doctor arrived).
const MILL_TEXT =
  "Whenever The Fifteenth Doctor enters or attacks, mill three cards. You may put an artifact card with mana value 2 or 3 from among them into your hand.";
const IMPROVISE_TEXT =
  "The first nonartifact spell you cast each turn has improvise. (Your artifacts can help cast that spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)";

const MILL = {
  kind: "sequence",
  effects: [
    { kind: "mill", target: "you", amount: 3 },
    {
      kind: "look-and-choose",
      zone: "graveyard",
      min: 0,
      max: 1,
      destination: "hand",
      leftover: "stay",
      filter: {
        thisWay: "milled",
        type: "artifact",
        anyOf: [{ manaValue: { op: "eq", n: 2 } }, { manaValue: { op: "eq", n: 3 } }],
      },
    },
  ],
} as const;

export default defineCard({
  name: "The Fifteenth Doctor",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 3,
  toughness: 3,
  text: `${MILL_TEXT}\n${IMPROVISE_TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: MILL, resolve: null, text: MILL_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: MILL, resolve: null, text: MILL_TEXT },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { notTypes: ["artifact"] }, improvise: true, firstEachTurn: true },
      text: IMPROVISE_TEXT,
    },
  ],
});
