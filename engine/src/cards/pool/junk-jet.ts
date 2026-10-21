import { defineCard } from "../define.js";

// EDHREC rank 9610.
// Makes Junk → "Junk Token".
//
// Rulings:
//   [2024-03-08] If a creature's power is less than 0 when it's doubled, instead that creature
//     gets -X/-0, where X is how much less than 0 its power is.
//   [2024-03-08] If you "double" a creature's power more than once in a turn, each doubling effect
//     applies independently.
//   [2024-03-08] If an effect instructs you to "double" a creature's power, that creature gets
//     +X/+0, where X is its power as that effect begins to apply.
//
// Bulk Up's shape: "double its power" is +X/+0 for its power as it resolves
// (`doubling` keeps a negative power as it is — the first ruling).

const DOUBLE = "{3}, Sacrifice another artifact: Double equipped creature's power until end of turn.";

export default defineCard({
  name: "Junk Jet",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `When this Equipment enters, create a Junk token. (It's an artifact with "{T}, Sacrifice this token: Exile the top card of your library. You may play that card this turn. Activate only as a sorcery.")\n${DOUBLE}\nEquip {1}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "attached",
        power: { powerOf: "attached", doubling: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: DOUBLE,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Junk Token", count: 1 },
      resolve: null,
      text: "When this Equipment enters, create a Junk token.",
    },
  ],
});
