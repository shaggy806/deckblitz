import { defineCard } from "../define.js";

// Rulings: with either target illegal the spell still resolves — the Aura
// doesn't move, but you draw; an Aura that can't legally enchant the creature
// doesn't move either. You keep control of the Aura wherever it goes.
export default defineCard({
  name: "Aura Finesse",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Attach target Aura you control to target creature.\nDraw a card.",
  targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Aura" } }, "creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "attach", target: 1, attachment: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
