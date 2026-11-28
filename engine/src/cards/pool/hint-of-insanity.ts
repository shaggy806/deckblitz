import { defineCard } from "../define.js";

// Odyssey. The whole hand revealed, then every nonland card sharing a name
// with another card in that hand discarded at once (`sameNameAsAnotherInZone`,
// asked of the whole hand before anything moves): both of two copies go, a
// lone card stays (rule 201.2a).

export default defineCard({
  name: "Hint of Insanity",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals their hand. That player discards all nonland cards with the same name as another card in their hand.",
  targets: ["player"],
  effect: {
    kind: "discard-hand",
    who: 0,
    filter: { notTypes: ["land"], sameNameAsAnotherInZone: true },
    reveal: true,
  },
});
