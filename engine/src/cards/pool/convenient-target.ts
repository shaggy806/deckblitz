import { defineCard } from "../define.js";

// Rulings:
//   [2024-02-02] If Convenient Target leaves the battlefield, the creature it was enchanting will
//     still be suspected until that creature leaves the battlefield or another effect causes it to
//     no longer be suspected.

const SUSPECT_TEXT = "When this Aura enters, suspect enchanted creature. (It has menace and can't block.)";
const PUMP_TEXT = "Enchanted creature gets +1/+1.";
const RETURN_TEXT = "{2}{R}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Convenient Target",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${SUSPECT_TEXT}\n${PUMP_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "suspect", target: "attached" },
      resolve: null,
      text: SUSPECT_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: PUMP_TEXT }],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
