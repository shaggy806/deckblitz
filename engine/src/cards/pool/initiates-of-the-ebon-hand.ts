import { defineCard } from "../define.js";

// A mana ability (rule 605.1a): it adds mana and doesn't target, so the rest
// of it happens as part of it, without the stack (605.3b) — the count read as
// it resolves, this activation among them, and the sacrifice a delayed
// trigger of this object only (rule 400.7). Every activation from the fourth
// on sets up its own.
const MANA_TEXT =
  "{1}: Add {B}. If this ability has been activated four or more times this turn, sacrifice this creature at the beginning of the next end step.";

export default defineCard({
  name: "Initiates of the Ebon Hand",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Cleric"],
  power: 1,
  toughness: 1,
  text: MANA_TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "B",
        amount: 1,
        also: {
          kind: "conditional",
          condition: { kind: "activated-this-turn", atLeast: 4 },
          then: {
            kind: "delayed-trigger",
            at: { step: "end" },
            effect: { kind: "sacrifice-source" },
            text: "Sacrifice Initiates of the Ebon Hand.",
          },
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
