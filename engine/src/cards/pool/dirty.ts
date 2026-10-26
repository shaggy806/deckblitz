import { defineCard } from "../define.js";

const FACES = ["Down // Dirty", "Down", "Dirty"];

// The right half of Down // Dirty (see down-dirty.ts).
export default defineCard({
  name: "Dirty",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return target card from your graveyard to your hand.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [{ kind: "card-in-graveyard", whose: "you" }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  faces: FACES,
  split: true,
});
