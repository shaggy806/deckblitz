import { defineCard } from "../define.js";

// EDHREC rank 9414. Zendikar Rising. A modal DFC; the back face is Pelakka
// Caverns. Coercion's shape, the choice limited to mana value 3 or greater
// (a card with {X} in its cost counts X as 0 in a hand — the ruling).

const TEXT =
  "Target opponent reveals their hand. You choose a card from it with mana value 3 or greater. That player discards that card.";

export default defineCard({
  name: "Pelakka Predation",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0, filter: { manaValue: { op: "gte", n: 3 } } },
  faces: ["Pelakka Predation", "Pelakka Caverns"],
});
