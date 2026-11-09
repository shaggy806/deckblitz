import { defineCard } from "../define.js";

const GRANT =
  "Each Sliver spell you cast has replicate. The replicate cost is equal to its mana cost. (A copy of a permanent spell becomes a token.)";

// A second Hatchery Sliver cast with this one in play has two replicates, its
// own {1}{G} and the granted one, each paid separately (rule 702.56b).
export default defineCard({
  name: "Hatchery Sliver",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  replicate: { cost: "{1}{G}" },
  text: `Replicate {1}{G} (When you cast this spell, copy it for each time you paid its replicate cost.)\n${GRANT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { subtype: "Sliver" }, keywordValues: [{ keyword: "replicate", cost: "mana-cost" }] },
      text: GRANT,
    },
  ],
});
