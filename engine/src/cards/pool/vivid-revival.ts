import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

export default defineCard({
  name: "Vivid Revival",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return up to three target multicolored cards from your graveyard to your hand. Exile Vivid Revival.",
  targets: distinctTargets(3, { kind: "card-in-graveyard", whose: "you", filter: { multicolored: true } }, { optional: true }),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
      { kind: "return-to-hand", target: 2, from: "graveyard" },
    ],
  },
  // Exiled only as it resolves: with every target gone it doesn't resolve
  // and goes to the graveyard (the ruling).
  exileOnResolve: true,
});
