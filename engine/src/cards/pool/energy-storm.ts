import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Ice Age (ICE). EDHREC rank 27667.
//
// The prevention reaches damage to anything (no `to`) from a source that's an
// instant or sorcery — the spell, as it resolves.

const PREVENT_TEXT = "Prevent all damage that would be dealt by instant and sorcery spells.";
const UNTAP_TEXT = "Creatures with flying don't untap during their controllers' untap steps.";
const UPKEEP = cumulativeUpkeep("{1}");

export default defineCard({
  name: "Energy Storm",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${UPKEEP.text}\n${PREVENT_TEXT}\n${UNTAP_TEXT}`,
  triggered: [UPKEEP],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, source: { typesAnyOf: ["instant", "sorcery"] } },
      text: PREVENT_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", keyword: "flying" } },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
