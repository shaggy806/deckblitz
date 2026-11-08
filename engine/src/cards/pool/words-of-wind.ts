import { defineCard } from "../define.js";

// Each player chooses a permanent they control in turn, knowing the choices
// before theirs, and all of them return at once (rule 101.4) — Dispersal's
// shape, as the draw's replacement.
const TEXT =
  "{1}: The next time you would draw a card this turn, each player returns a permanent they control to its owner's hand instead.";

export default defineCard({
  name: "Words of Wind",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        next: true,
        replacement: { event: "would-draw", who: "you", instead: { effect: {
            kind: "sequence",
            effects: [
              { kind: "vote", choose: true, who: "each-player", for: { permanent: { controlledBy: "you" }, own: true } },
              { kind: "for-each-voted", which: "voted", simultaneous: true, effect: { kind: "return-to-hand", target: 0 } },
            ],
          },
          text: "Instead, each player returns a permanent they control to its owner's hand." } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
