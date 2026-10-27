import { defineCard } from "../define.js";

// Time Spiral. EDHREC rank 22267.
//
// Rulings:
//   [2006-09-25] If a spell would deal damage to multiple creatures and/or players, Plated Pegasus
//     will prevent 1 damage that the spell would deal to each of them.
//
// Benevolent Unicorn's shape: a replacement on damage from instant and
// sorcery sources (the only spells that deal damage), one less to each
// recipient. The engine has no "damage can't be prevented" effect, so
// preventing 1 and dealing 1 less are the same event here.

const TEXT =
  "If a spell would deal damage to a permanent or player, prevent 1 damage that spell would deal to that permanent or player.";

export default defineCard({
  name: "Plated Pegasus",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 1,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nFlying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", plus: -1, source: { typesAnyOf: ["instant", "sorcery"] } },
      text: TEXT,
    },
  ],
});
