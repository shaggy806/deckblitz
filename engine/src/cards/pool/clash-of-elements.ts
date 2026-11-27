import { defineCard } from "../define.js";

// The owner decides (`as-player` of `{ ownerOf: 0 }` around a `may`): on top
// and they're dealt 2 damage by this spell, or it goes on the bottom.

const TEXT =
  "Choose target nonland permanent. Its owner may put it on top of their library. If they do, Clash of Elements deals 2 damage to them. If they didn't put the card on top of their library, they put it on the bottom.";

export default defineCard({
  name: "Clash of Elements",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: TEXT,
  targets: ["nonland-permanent"],
  effect: {
    kind: "as-player",
    who: { ownerOf: 0 },
    effect: {
      kind: "may",
      prompt: "Put it on top of your library, and be dealt 2 damage? (Otherwise it goes on the bottom.)",
      effect: { kind: "put-on-library", target: 0, position: "top" },
      then: { kind: "damage", amount: 2, who: "you" },
      else: { kind: "put-on-library", target: 0, position: "bottom" },
    },
  },
});
