import { defineCard } from "../define.js";

// The left half of Revival // Revenge (see revival-revenge.ts). Claim's shape.
const FACES = ["Revival // Revenge", "Revival", "Revenge"];

export default defineCard({
  name: "Revival",
  manaCost: "{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Return target creature card with mana value 3 or less from your graveyard to the battlefield.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
  faces: FACES,
  split: true,
});
