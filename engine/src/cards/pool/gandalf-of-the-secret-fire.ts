import { defineCard } from "../define.js";

// Marks the spell; it's exiled as it finishes resolving, a countered one is not.
const TEXT =
  "Whenever you cast an instant or sorcery spell from your hand during an opponent's turn, exile that card with three time counters on it instead of putting it into your graveyard as it resolves. Then if the exiled card doesn't have suspend, it gains suspend. (At the beginning of your upkeep, remove a time counter. When the last is removed, you may play it without paying its mana cost.)";

export default defineCard({
  name: "Gandalf of the Secret Fire",
  manaCost: "{1}{U}{R}{W}",
  colors: ["U", "R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Avatar", "Wizard"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "hand", filter: { typesAnyOf: ["instant", "sorcery"] } },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: [],
      effect: { kind: "exile-spell-as-it-resolves", timeCounters: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
