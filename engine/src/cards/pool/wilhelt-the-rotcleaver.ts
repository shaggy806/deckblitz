import { defineCard } from "../define.js";

// EDHREC rank 2758.
// Makes Zombie → new token "Zombie Token (Wilhelt, the Rotcleaver)" (scaffolded).
//
// Rulings:
//   [2021-09-24] Once a creature with decayed attacks, it will be sacrificed at end of combat,
//     even if it no longer has decayed at that time.
//   [2021-09-24] Decayed does not grant haste. Creatures with decayed that enter the battlefield
//     during your turn may not attack until your next turn.
//   [2021-09-24] Decayed does not create any attacking requirements. You may choose not to attack
//     with a creature that has decayed.
//   [2021-09-24] Decayed represents a static ability and a triggered ability. “Decayed” means
//     “This creature can't block” and “When this creature attacks, sacrifice it at end of combat.”

export default defineCard({
  name: "Wilhelt, the Rotcleaver",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 3,
  toughness: 3,
  text: "Whenever another Zombie you control dies, if it didn't have decayed, create a 2/2 black Zombie creature token with decayed. (It can't block. When it attacks, sacrifice it at end of combat.)\nAt the beginning of your end step, you may sacrifice a Zombie. If you do, draw a card.",
  triggered: [
    {
      // "If it didn't have decayed": read off the Zombie as it last existed,
      // which can't change before the trigger resolves.
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { subtype: "Zombie", notKeyword: "decayed" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token (Wilhelt, the Rotcleaver)", count: 1 },
      resolve: null,
      text: "Whenever another Zombie you control dies, if it didn't have decayed, create a 2/2 black Zombie creature token with decayed.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { subtype: "Zombie" }, text: "Sacrifice a Zombie" }],
        ifDid: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your end step, you may sacrifice a Zombie. If you do, draw a card.",
    },
  ],
});
