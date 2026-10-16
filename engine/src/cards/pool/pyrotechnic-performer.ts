import { defineCard } from "../define.js";

// EDHREC rank 12087.
//
// Disguise {R}. "This creature or another creature you control is turned
// face up" is any creature you control (Trail of Mystery's trigger), this
// one included once it's face up. That creature deals the damage, equal to
// its power — as it last existed if it has left by then (the ruling).
const TRIGGER =
  "Whenever this creature or another creature you control is turned face up, that creature deals damage equal to its power to each opponent.";

export default defineCard({
  name: "Pyrotechnic Performer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Assassin"],
  power: 3,
  toughness: 2,
  text: `Disguise {R} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)\n${TRIGGER}`,
  morph: { keyword: "disguise", cost: "{R}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "damage",
        amount: { powerOf: "trigger-object" },
        who: "each-opponent",
        from: "trigger-object",
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
