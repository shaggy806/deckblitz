import { defineCard } from "../define.js";

// EDHREC rank 15379.
//
// Constellation: this creature is an enchantment, so "this creature or
// another enchantment you control" is every enchantment you control entering
// (Archon of Sun's Grace). Base P/T 4/4 is layer 7b (Quandrix Charm's
// animate), under counters and other modifications (the ruling).

const CONSTELLATION_TEXT =
  "Constellation — Whenever this creature or another enchantment you control enters, choose target creature you control. Until end of turn, that creature has base power and toughness 4/4 and gains flying.";

export default defineCard({
  name: "Eidolon of Astral Winds",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${CONSTELLATION_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: 0,
            power: 4,
            toughness: 4,
            addTypes: [],
            addSubtypes: [],
            duration: "end-of-turn",
          },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CONSTELLATION_TEXT,
    },
  ],
});
