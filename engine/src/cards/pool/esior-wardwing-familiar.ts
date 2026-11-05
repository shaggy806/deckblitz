import { defineCard } from "../define.js";

// EDHREC rank 3425.

export default defineCard({
  name: "Esior, Wardwing Familiar",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  pairing: { kind: "partner" },
  text: "Flying\nSpells your opponents cast that target one or more commanders you control cost {3} more to cast.\nPartner (You can have two commanders if both have partner.)",
  static: [
    {
      affects: { scope: "self" },
      targetedBySpellsCost: { payGeneric: 3, targeting: { isCommander: true, controlledBy: "you" } },
      text: "Spells your opponents cast that target one or more commanders you control cost {3} more to cast.",
    },
  ],
});
