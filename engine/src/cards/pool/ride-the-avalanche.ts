import { defineCard } from "../define.js";

// EDHREC rank 16863. The delayed ability chooses its target as it goes on the
// stack, after the next spell is cast (the ruling).
const TEXT =
  "The next spell you cast this turn can be cast as though it had flash. When you next cast a spell this turn, put X +1/+1 counters on up to one target creature, where X is the mana value of that spell.";

export default defineCard({
  name: "Ride the Avalanche",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "player-effect", duration: "end-of-turn", castAsThoughFlash: { next: true } },
      {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "cast-spell", who: "you" },
          once: true,
          targets: [{ kind: "optional", of: "creature" }],
        },
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { manaValueOf: "trigger-object" } },
        text: "When you next cast a spell this turn, put X +1/+1 counters on up to one target creature, where X is the mana value of that spell.",
      },
    ],
  },
});
