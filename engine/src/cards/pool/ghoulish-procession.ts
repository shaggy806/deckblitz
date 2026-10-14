import { defineCard } from "../define.js";

// EDHREC rank 5051.
// Makes Zombie → new token "Zombie Token (Ghoulish Procession)" (scaffolded).
//
// Rulings:
//   [2021-09-24] Decayed represents a static ability and a triggered ability. "Decayed" means
//     "This creature can't block" and "When this creature attacks, sacrifice it at end of combat."
//   [2021-09-24] Decayed does not grant haste. Creatures with decayed that enter the battlefield
//     during your turn may not attack until your next turn.
//   [2021-09-24] Once a creature with decayed attacks, it will be sacrificed at end of combat,
//     even if it no longer has decayed at that time.
//   [2021-09-24] Decayed does not create any attacking requirements. You may choose not to attack
//     with a creature that has decayed.

export default defineCard({
  name: "Ghoulish Procession",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Whenever one or more nontoken creatures die, create a 2/2 black Zombie creature token with decayed. This ability triggers only once each turn. (A creature with decayed can't block. When it attacks, sacrifice it at end of combat.)",
  triggered: [
    {
      // "One or more … only once each turn": the turn's first death of a
      // nontoken creature triggers it, in that event or not, and no later one.
      trigger: { on: "dies", who: "any", filter: { type: "creature", token: false } },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token (Ghoulish Procession)", count: 1 },
      resolve: null,
      text: "Whenever one or more nontoken creatures die, create a 2/2 black Zombie creature token with decayed. This ability triggers only once each turn.",
    },
  ],
});
