import { defineCard } from "../define.js";

// EDHREC rank 21264.
// Pristine Talisman's shape: the life is part of the mana ability (`also`),
// so it doesn't use the stack, and the "if" is read as the mana is made.

const TEXT = "{T}: Add {G}. If you control another Mutant, you gain 1 life.";

export default defineCard({
  name: "Black Tom Cassidy",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Villain"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "G",
        amount: 1,
        also: {
          kind: "conditional",
          condition: { kind: "controls", filter: { subtype: "Mutant" }, atLeast: 1, excludeSelf: true },
          then: { kind: "gain-life", amount: 1 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
