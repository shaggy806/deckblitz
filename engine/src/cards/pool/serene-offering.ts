import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 24707.
//
// Divine Offering's shape: "its mana value" is read as the enchantment last
// existed if the destroy moved it (rule 608.2h), or as it is if it survived.
export default defineCard({
  name: "Serene Offering",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target enchantment. You gain life equal to its mana value.",
  targets: ["enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: { manaValueOf: 0 } },
    ],
  },
});
