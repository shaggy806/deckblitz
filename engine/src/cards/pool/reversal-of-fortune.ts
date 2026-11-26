import { defineCard } from "../define.js";

// EDHREC rank 21280.
//
// Mindclaw Shaman's reveal and cast from the opponent's hand, but of a copy
// (Narset's `copies: 1`): the copy is created in that hand, the card's own
// zone (rule 707.12), owned by the caster, and cast free; one not cast ceases
// to exist (704.5e), so "you may copy … if you do, you may cast the copy" is
// one choice. "An instant or sorcery **card**" is judged as the card lies in
// the hand (`filter`), not as the face cast.
const TEXT =
  "Target opponent reveals their hand. You may copy an instant or sorcery card in it. If you do, you may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Reversal of Fortune",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-hand", who: 0 },
      {
        kind: "cast-now",
        from: { handOf: { target: 0 } },
        filter: { typesAnyOf: ["instant", "sorcery"] },
        copies: 1,
        free: true,
      },
    ],
  },
});
