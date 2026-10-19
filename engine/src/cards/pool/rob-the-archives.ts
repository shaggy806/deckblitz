import { defineCard } from "../define.js";

export default defineCard({
  name: "Rob the Archives",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  casualty: 1,
  text:
    "Casualty 1 (As you cast this spell, you may sacrifice a creature with power 1 or greater. When you do, copy this spell.)\n" +
    "Exile the top two cards of your library. You may play those cards this turn.",
  // Played under the normal timing rules and costs (the ruling) — impulse-exile's permission.
  effect: { kind: "impulse-exile", amount: 2, duration: "end-of-turn" },
});
