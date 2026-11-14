import { defineCard } from "../define.js";

// EDHREC rank 8322. "When you cast a spell this way" is the permission's
// `whenCast`: a delayed triggered ability of this effect (rule 603.7) that
// finds the spell only when it's cast under the permission (400.7h) — a land
// played this way isn't cast, so nothing triggers. "Its owner" is the spell's
// owner, read with its mana value as it is (or last was) on the stack, X
// included (the rulings).

const TEXT =
  "At the beginning of your upkeep, choose an opponent at random. Exile the top card of that player's library. Until end of turn, you may play that card and you may spend mana as though it were mana of any color to cast it. When you cast a spell this way, its owner loses life equal to its mana value.";

export default defineCard({
  name: "The Ruinous Powers",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-opponent",
        random: true,
        then: {
          kind: "impulse-exile",
          amount: 1,
          whose: "that-player",
          duration: "end-of-turn",
          play: true,
          spendAs: "any-color",
          whenCast: {
            effect: { kind: "lose-life", amount: { manaValueOf: "trigger-object" }, who: { ownerOf: "trigger-object" } },
            text: "When you cast a spell this way, its owner loses life equal to its mana value.",
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
