import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// The name is chosen as it resolves (its ruling), then Persecute's shape:
// the hand revealed and every card with that name discarded.
const TEXT = "Choose a nonland card name. Target player reveals their hand and discards all cards with that name.";

export default defineCard({
  name: "Cabal Therapy",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${TEXT}\nFlashback—Sacrifice a creature. (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: ["player"],
  effect: {
    kind: "choose-card-name",
    filter: { notTypes: ["land"] },
    then: { kind: "discard-hand", who: 0, filter: { hasName: CHOSEN_CARD_NAME }, reveal: true },
  },
  flashback: { cost: "", sacrifice: { filter: { type: "creature" }, count: 1 } },
});
