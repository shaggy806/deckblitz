import { defineCard } from "../define.js";

// EDHREC rank 15579.
//
// The shuffle isn't targeted: the cards are chosen from your graveyard as
// the spell resolves, after the mill, so they may be ones just milled (the
// rulings) — a graveyard `look-and-choose` onto the library, then a shuffle.
// The spell itself is on the stack meanwhile and can't be chosen. Replicate
// is the multi kicker (Train of Thought's), each copy with its own target.

export default defineCard({
  name: "Stream of Thought",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  kicker: { cost: "{2}{U}{U}", keyword: "replicate", multi: true },
  text: "Target player mills four cards. You shuffle up to four cards from your graveyard into your library.\nReplicate {2}{U}{U} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: 0, amount: 4 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 4,
        destination: "library-top",
        leftover: "stay",
      },
      { kind: "shuffle-library" },
    ],
  },
});
