import { defineCard } from "../define.js";

// Elite Interceptor's prepare spell (rule 722): no card of its own, only ever
// cast as the copy a prepared Elite Interceptor makes in exile (722.3c).
// "You may tap or untap" is Retreat to Coralhelm's `modal` of zero or one of
// the two; the draw happens either way — but not with the target gone (rule
// 608.2b: the spell doesn't resolve).
export default defineCard({
  name: "Rejoinder",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "You may tap or untap target creature.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
