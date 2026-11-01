import { defineCard } from "../define.js";

// EDHREC rank 24969. Each target's base P/T (layer 7b), flying (layer 6), the
// Illusion type (layer 4) and blue in addition to its colours (layer 5).

const form = (target: number) =>
  ({
    kind: "animate",
    target,
    power: 3,
    toughness: 3,
    addTypes: [],
    addSubtypes: ["Illusion"],
    addColors: ["U"],
    keywords: ["flying"],
    duration: "end-of-turn",
  }) as const;

export default defineCard({
  name: "Phantasmal Form",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, up to two target creatures each have base power and toughness 3/3, gain flying, and become blue Illusions in addition to their other colors and types.\nDraw a card.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: { kind: "sequence", effects: [form(0), form(1), { kind: "draw", amount: 1 }] },
});
