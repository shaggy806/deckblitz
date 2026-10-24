import { defineCard } from "../define.js";

// EDHREC rank 17166.
//
// Rulings: the CDA counts itself on the battlefield; any other untapped Ally
// may be tapped, a summoning-sick one included (no {T} symbol); the keyword
// is chosen as the ability resolves (the `modal` effect asks then).
const PT_TEXT = "Veteran Warleader's power and toughness are each equal to the number of creatures you control.";
const TAP =
  "Tap another untapped Ally you control: This creature gains your choice of first strike, vigilance, or trample until end of turn.";

export default defineCard({
  name: "Veteran Warleader",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${TAP}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 1, filter: { subtype: "Ally", controlledBy: "you" } } },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "First strike",
            effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
          },
          {
            text: "Vigilance",
            effect: { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" },
          },
          {
            text: "Trample",
            effect: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TAP,
    },
  ],
});
