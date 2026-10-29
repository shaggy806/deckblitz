import { defineCard } from "../define.js";

// EDHREC rank 25043. Protection from a creature type as Foothill Guide's;
// "except by creatures with haste" is the filter's negation, and a block
// already made stands (the ruling).

const DODGE = "{3}: This creature can't be blocked this turn except by creatures with haste.";

export default defineCard({
  name: "Resilient Roadrunner",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste, protection from Coyotes\n${DODGE}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Coyote" } },
      text: "Protection from Coyotes",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "restrict",
        target: "source",
        restrictions: [],
        cantBeBlockedBy: { notKeyword: "haste" },
      },
      resolve: null,
      text: DODGE,
    },
  ],
});
