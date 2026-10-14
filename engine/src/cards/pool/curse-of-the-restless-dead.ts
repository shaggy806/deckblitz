import { defineCard } from "../define.js";

// EDHREC rank 5166.
// Makes Zombie → new token "Zombie Token (Curse of the Restless Dead)" (scaffolded).
//
// Rulings:
//   [2021-09-24] Decayed does not create any attacking requirements. You may choose not to attack
//     with a creature that has decayed.
//   [2021-09-24] Decayed does not grant haste. Creatures with decayed that enter the battlefield
//     during your turn may not attack until your next turn.
//   [2021-09-24] Decayed represents a static ability and a triggered ability. “Decayed” means
//     “This creature can't block” and “When this creature attacks, sacrifice it at end of combat.”
//   [2021-09-24] The controller of Curse of the Restless Dead gets the Zombie token. This may not
//     be the same player as the enchanted player.
//   [2021-09-24] Once a creature with decayed attacks, it will be sacrificed at end of combat,
//     even if it no longer has decayed at that time.

export default defineCard({
  name: "Curse of the Restless Dead",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: "Enchant player\nWhenever a land enchanted player controls enters, you create a 2/2 black Zombie creature token with decayed. (It can't block. When it attacks, sacrifice it at end of combat.)",
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "enchanted-player-controls", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token (Curse of the Restless Dead)", count: 1 },
      resolve: null,
      text: "Whenever a land enchanted player controls enters, you create a 2/2 black Zombie creature token with decayed.",
    },
  ],
});
