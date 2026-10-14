import { defineCard } from "../define.js";

// EDHREC rank 1336.
// Makes Zombie → new token "Zombie Token (Jadar, Ghoulcaller of Nephalia)" (scaffolded).
//
// Rulings:
//   [2021-09-24] Decayed does not create any attacking requirements. You may choose not to attack
//     with a creature that has decayed.
//   [2021-09-24] Once a creature with decayed attacks, it will be sacrificed at end of combat,
//     even if it no longer has decayed at that time.
//   [2021-09-24] Decayed represents a static ability and a triggered ability. "Decayed" means
//     "This creature can't block" and "When this creature attacks, sacrifice it at end of combat."
//   [2021-09-24] Decayed does not grant haste. Creatures with decayed that enter the battlefield
//     during your turn may not attack until your next turn.

export default defineCard({
  name: "Jadar, Ghoulcaller of Nephalia",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "At the beginning of your end step, if you control no creatures with decayed, create a 2/2 black Zombie creature token with decayed. (It can't block. When it attacks, sacrifice it at end of combat.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { type: "creature", keyword: "decayed" }, atLeast: 1 },
      },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token (Jadar, Ghoulcaller of Nephalia)", count: 1 },
      resolve: null,
      text: "At the beginning of your end step, if you control no creatures with decayed, create a 2/2 black Zombie creature token with decayed.",
    },
  ],
});
