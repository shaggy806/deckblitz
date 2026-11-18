import { defineCard } from "../define.js";

// EDHREC rank 21509.
//
// The creature cards the transform ability's cost exiles are exiled with Ludevic
// (rule 607.2a; abilities on either face are linked, 607.1b): what Olag, Ludevic's
// Hubris copies one of and counts as it transforms (its own file). X can't be 0.

const MILL_TEXT = "Whenever Ludevic enters or attacks, mill a card.";
const TRANSFORM_TEXT =
  "{X}{U}{U}{B}{B}, Exile X creature cards from your graveyard: Transform Ludevic. X can't be 0. Activate only as a sorcery.";

export default defineCard({
  name: "Ludevic, Necrogenius",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${MILL_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 1 },
      resolve: null,
      text: MILL_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 1 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{X}{U}{U}{B}{B}",
        tap: false,
        exileFromGraveyard: { count: "x", filter: { type: "creature" }, linked: true },
      },
      minX: 1,
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Ludevic, Necrogenius", "Olag, Ludevic's Hubris"],
  transform: true,
});
