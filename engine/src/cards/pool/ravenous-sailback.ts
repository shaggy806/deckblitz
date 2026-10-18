import { defineCard } from "../define.js";

// EDHREC rank 15403. March of the Machine Commander.
//
// Coliseum Behemoth's modal enters trigger: the mode is chosen as it goes on
// the stack, with its target (rule 700.2a).

export default defineCard({
  name: "Ravenous Sailback",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 4,
  text: "When this creature enters, choose one —\n• This creature gains haste until end of turn.\n• Destroy target artifact or enchantment.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "This creature gains haste until end of turn.",
            effect: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
          },
          {
            text: "Destroy target artifact or enchantment.",
            targets: ["artifact-or-enchantment"],
            effect: { kind: "destroy", target: 0 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
