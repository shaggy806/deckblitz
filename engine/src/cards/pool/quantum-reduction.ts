import { defineCard } from "../define.js";

// EDHREC rank 25501.
//
// Teamwork 2 is a kicker (rule 702.194); "cast using teamwork" is the spell being
// kicked, whose variant may be cast as though it had flash (`flash`, Molten Exhale's
// shape — rule 601.3c).

export default defineCard({
  name: "Quantum Reduction",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Teamwork 2 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 2 or more.)\nYou may cast this spell as though it had flash if it's cast using teamwork.\nEnchant creature\nEnchanted creature gets -5/-0 and loses all abilities.",
  targets: ["creature"],
  kicker: { cost: "", keyword: "teamwork", teamwork: 2, flash: true },
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-5, 0],
      loseAllAbilities: true,
      text: "Enchanted creature gets -5/-0 and loses all abilities.",
    },
  ],
});
