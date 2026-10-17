import { defineCard } from "../define.js";

// EDHREC rank 12523.
// Makes Treefolk → "Treefolk Token (Sylvan Offering)", the vanilla green 0/0 Treefolk
// given its X/X as created (`basePt`, the X it was cast with).

export default defineCard({
  name: "Arboreal Alliance",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "When this enchantment enters, create an X/X green Treefolk creature token.\nWhenever you attack with one or more Elves, populate. (Create a token that's a copy of a creature token you control.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Treefolk Token (Sylvan Offering)",
        count: 1,
        basePt: { power: "x", toughness: "x" },
      },
      resolve: null,
      text: "When this enchantment enters, create an X/X green Treefolk creature token.",
    },
    {
      // Once per attack declaration, however many Elves (the first ruling).
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { subtype: "Elf" } },
      targets: [],
      effect: { kind: "populate" },
      resolve: null,
      text: "Whenever you attack with one or more Elves, populate.",
    },
  ],
});
