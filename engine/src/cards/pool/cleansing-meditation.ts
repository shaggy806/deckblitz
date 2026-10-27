import { defineCard } from "../define.js";

// Threshold is checked as it resolves (rule 702.27). "Destroyed this way" and
// still in your graveyard is `thisWay: "died"` (destroyed, and put into a
// graveyard) read over your own graveyard; each returning Aura chooses what it
// enchants among what's already on the battlefield before any of them moves
// (rule 303.4f — the rulings), and one with nothing to enchant stays.
export default defineCard({
  name: "Cleansing Meditation",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all enchantments.\nThreshold — If there are seven or more cards in your graveyard, instead destroy all enchantments, then return all cards in your graveyard destroyed this way to the battlefield.",
  effect: {
    kind: "conditional",
    condition: { kind: "threshold" },
    then: {
      kind: "sequence",
      effects: [
        { kind: "destroy-all", filter: { type: "enchantment" } },
        { kind: "return-from-graveyard", filter: { thisWay: "died" }, destination: "battlefield", count: "all" },
      ],
    },
    else: { kind: "destroy-all", filter: { type: "enchantment" } },
  },
});
