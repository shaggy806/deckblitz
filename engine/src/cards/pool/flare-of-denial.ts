import { defineCard } from "../define.js";

// Modern Horizons 3 (MH3). EDHREC rank 1446.
//
// "You may sacrifice a nontoken blue creature rather than pay this spell's
// mana cost": an alternative cost (rule 118.9), the creature chosen as the
// cost is paid (601.2h).

export default defineCard({
  name: "Flare of Denial",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may sacrifice a nontoken blue creature rather than pay this spell's mana cost.\nCounter target spell.",
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { type: "creature", colors: ["U"], token: false }, text: "a nontoken blue creature" },
  },
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
