import { defineCard } from "../define.js";

// Mirage. EDHREC rank 19698.
//
// Rulings:
//   [2004-10-04] It can be used during upkeep to create a Pegasus token in time for it to be
//     sacrificed.

export default defineCard({
  name: "Sacred Mesa",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, sacrifice this enchantment unless you sacrifice a Pegasus.\n{1}{W}: Create a 1/1 white Pegasus creature token with flying.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { subtype: "Pegasus" }, text: "Sacrifice a Pegasus" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice this enchantment unless you sacrifice a Pegasus.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Pegasus Token", count: 1 },
      resolve: null,
      text: "{1}{W}: Create a 1/1 white Pegasus creature token with flying.",
    },
  ],
});
