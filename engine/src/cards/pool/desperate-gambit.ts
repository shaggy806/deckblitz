import { defineCard } from "../define.js";

// Unlimited Edition (2ED). EDHREC rank 12081.
//
// The source is chosen as it resolves (rule 609.7a: a permanent, a spell on
// the stack, or what an ability on the stack refers to — the chosen-source
// shield's choice, `damageSource`), then the coin is flipped, so the result
// is known before the source next deals damage (the ruling). Either result is
// a one-shot shield for this turn on that source's next damage event, to
// anything, combat or not (rules 614.1a, 615.8): doubled, or prevented. A
// permanent spell chosen is followed to the permanent it becomes (609.7a).
//
// Rulings:
//   - The coin is flipped during resolution of this spell, so you know in advance what will
//     happen when the source deals damage the next time.
//   - The chosen source may be a permanent, a spell on the stack, or anything referred to by
//     something on the stack (such as a Prodigal Pyromancer that's left the battlefield while its
//     ability is still on the stack)

const TEXT =
  "Choose a source you control and flip a coin. If you win the flip, the next time that source would deal damage this turn, it deals double that damage instead. If you lose the flip, the next time it would deal damage this turn, prevent that damage.";

export default defineCard({
  name: "Desperate Gambit",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "choose-permanents",
    damageSource: true,
    filter: { controlledBy: "you" },
    min: 1,
    upTo: 1,
    prompt: "Choose a source you control",
    then: {
      kind: "flip-coin",
      won: {
        kind: "replacement-effect",
        replacement: { event: "would-deal-damage", instead: { modify: { times: 2 } } },
        duration: "end-of-turn",
        next: true,
        fromObject: 0,
      },
      lost: {
        kind: "replacement-effect",
        replacement: { event: "would-deal-damage", instead: { prevent: true } },
        duration: "end-of-turn",
        next: true,
        fromObject: 0,
      },
    },
  },
});
