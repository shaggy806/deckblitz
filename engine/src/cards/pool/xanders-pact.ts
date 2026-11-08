import { defineCard } from "../define.js";

// Inside Information's permission, cast-only ("you may cast spells from among
// those cards"), over each opponent's top card.
export default defineCard({
  name: "Xander's Pact",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Casualty 2 (As you cast this spell, you may sacrifice a creature with power 2 or greater. When you do, copy this spell.)\nEach opponent exiles the top card of their library. You may cast spells from among those cards this turn. If you cast a spell this way, pay life equal to that spell's mana value rather than pay its mana cost.",
  casualty: 2,
  effect: {
    kind: "impulse-exile",
    amount: 1,
    duration: "end-of-turn",
    whose: "each-opponent",
    byPayingLife: true,
  },
});
