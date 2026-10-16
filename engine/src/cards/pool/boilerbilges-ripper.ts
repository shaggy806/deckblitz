import { defineCard } from "../define.js";

// EDHREC rank 22092. General Traag, Heart of Stone's shape: an optional
// sacrifice of another creature or enchantment, and a reflexive trigger whose
// target is chosen only once the sacrifice is made.
//
// Rulings:
//   You don't choose a target for Boilerbilges Ripper's ability at the time it triggers. Rather, a
//     second "reflexive" ability triggers when you sacrifice another creature or enchantment this
//     way. You choose a target for that ability as it goes on the stack. Each player may respond
//     to this triggered ability as normal.
const ENTER_TEXT =
  "When this creature enters, you may sacrifice another creature or enchantment. When you do, this creature deals 2 damage to any target.";

export default defineCard({
  name: "Boilerbilges Ripper",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 4,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { typesAnyOf: ["creature", "enchantment"] },
            exceptSource: true,
            text: "Sacrifice another creature or enchantment",
          },
        ],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["any-target"],
          effect: { kind: "damage", amount: 2, target: 0 },
          text: "When you do, this creature deals 2 damage to any target.",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
