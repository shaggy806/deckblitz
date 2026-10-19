import { defineCard } from "../define.js";

// Domain: {1} less for each basic land type among lands you control — generic
// mana only, so never below {G} (the ruling); its mana value stays 8.

const TEXT = "Domain — This spell costs {1} less to cast for each basic land type among lands you control.";

export default defineCard({
  name: "Yavimaya Sojourner",
  manaCost: "{7}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 4,
  toughness: 6,
  text: TEXT,
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { basicLandTypes: "you" },
  },
});
