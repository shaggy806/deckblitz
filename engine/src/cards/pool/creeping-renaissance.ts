import { defineCard } from "../define.js";
import type { CardType } from "../define.js";

// "Choose a permanent type" as it resolves: one of the six (rule 110.4 —
// artifact, battle, creature, enchantment, land, planeswalker), each a mode
// of a resolution-time `modal` (Winding Way's shape), so a copy chooses anew
// and it isn't a modal spell for "whenever you cast a modal spell".
const returnAll = (type: CardType, text: string) =>
  ({
    text,
    effect: { kind: "return-from-graveyard", filter: { type }, destination: "hand", count: "all" },
  }) as const;

export default defineCard({
  name: "Creeping Renaissance",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{5}{G}{G}" },
  text: "Choose a permanent type. Return all cards of the chosen type from your graveyard to your hand.\nFlashback {5}{G}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: [
      returnAll("artifact", "Artifact"),
      returnAll("battle", "Battle"),
      returnAll("creature", "Creature"),
      returnAll("enchantment", "Enchantment"),
      returnAll("land", "Land"),
      returnAll("planeswalker", "Planeswalker"),
    ],
  },
});
