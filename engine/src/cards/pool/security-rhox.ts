import { defineCard } from "../define.js";

// Streets of New Capenna (SNC). EDHREC rank 26921.
//
// An alternative cost (rule 118.9) paid only with mana Treasures made, read
// off each unit's origin as it was made — the Treasure is gone by then.

export default defineCard({
  name: "Security Rhox",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Rhino", "Warrior"],
  power: 5,
  toughness: 4,
  text: "You may pay {R}{G} rather than pay this spell's mana cost. Spend only mana produced by Treasures to cast it this way.",
  alternativeCost: { mana: "{R}{G}", spendOnlyManaFrom: { subtype: "Treasure" } },
});
