import { defineCard } from "../define.js";

// Hidden Horror's shape off a `becomes-target` trigger: a `may` of the discard,
// not offered with no land card in hand (`mayBeDone`), and "unless" its `else`.

const TEXT = "Whenever this creature becomes the target of a spell or ability, sacrifice it unless you discard a land card.";

export default defineCard({
  name: "Cursed Monstrosity",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a land card to keep Cursed Monstrosity?",
        effect: { kind: "discard", target: "you", amount: 1, filter: { type: "land" } },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
