import { defineCard } from "../define.js";

// The half of Claim // Fame cast from the hand.
const FACES = ["Claim // Fame", "Claim", "Fame"];

export default defineCard({
  name: "Claim",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card with mana value 2 or less from your graveyard to the battlefield.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } }],
  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
  faces: FACES,
  split: true,
});
