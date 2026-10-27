import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 26481. Beat a Path's shape, one
// slot more: three distinct optional targets.

export default defineCard({
  name: "Unearthly Blizzard",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Up to three target creatures can't block this turn.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      { kind: "restrict", target: 1, restrictions: ["cant-block"] },
      { kind: "restrict", target: 2, restrictions: ["cant-block"] },
    ],
  },
});
