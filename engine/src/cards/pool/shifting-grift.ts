import { defineCard } from "../define.js";

const CREATURES = "+ {2} — Exchange control of two target creatures.";
const ARTIFACTS = "+ {1} — Exchange control of two target artifacts.";
const ENCHANTMENTS = "+ {1} — Exchange control of two target enchantments.";

// Spree (rule 702.172a). Each exchange is all or nothing (701.12b): nothing
// happens to a pair one player controls, or one with an illegal target.
export default defineCard({
  name: "Shifting Grift",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `Spree (Choose one or more additional costs.)\n${CREATURES}\n${ARTIFACTS}\n${ENCHANTMENTS}`,
  castModal: {
    minModes: 1,
    maxModes: 3,
    modes: [
      {
        text: CREATURES,
        spreeCost: "{2}",
        targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 } }],
        effect: { kind: "exchange-control", objects: [0, 1] },
      },
      {
        text: ARTIFACTS,
        spreeCost: "{1}",
        targets: ["artifact", { kind: "other", of: "artifact", than: { slot: 0 } }],
        effect: { kind: "exchange-control", objects: [0, 1] },
      },
      {
        text: ENCHANTMENTS,
        spreeCost: "{1}",
        targets: ["enchantment", { kind: "other", of: "enchantment", than: { slot: 0 } }],
        effect: { kind: "exchange-control", objects: [0, 1] },
      },
    ],
  },
});
