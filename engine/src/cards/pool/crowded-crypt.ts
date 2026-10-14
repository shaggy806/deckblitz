import { defineCard } from "../define.js";

// EDHREC rank 2428.
// Makes Zombie → new token "Zombie Token (Crowded Crypt)" (scaffolded).
//
// Rulings:
//   [2021-09-24] Decayed does not grant haste. Creatures with decayed that enter the battlefield
//     during your turn may not attack until your next turn.
//   [2021-09-24] Once a creature with decayed attacks, it will be sacrificed at end of combat,
//     even if it no longer has decayed at that time.
//   [2021-09-24] Decayed represents a static ability and a triggered ability. “Decayed” means
//     “This creature can't block” and “When this creature attacks, sacrifice it at end of combat.”
//   [2021-09-24] Decayed does not create any attacking requirements. You may choose not to attack
//     with a creature that has decayed.

export default defineCard({
  name: "Crowded Crypt",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: "{T}: Add {B}.\nWhenever a creature you control dies, put a corpse counter on this artifact.\n{4}{B}{B}, {T}, Sacrifice this artifact: Create a 2/2 black Zombie creature token with decayed for each corpse counter on this artifact. (A creature with decayed can't block. When it attacks, sacrifice it at end of combat.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: "{4}{B}{B}", tap: true, sacrifice: "self" },
      targets: [],
      // Counted as it last existed, sacrificed to pay the cost.
      effect: {
        kind: "create-token",
        token: "Zombie Token (Crowded Crypt)",
        count: { countersOn: "source", counter: "corpse" },
      },
      resolve: null,
      text: "{4}{B}{B}, {T}, Sacrifice this artifact: Create a 2/2 black Zombie creature token with decayed for each corpse counter on this artifact.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "corpse", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control dies, put a corpse counter on this artifact.",
    },
  ],
});
