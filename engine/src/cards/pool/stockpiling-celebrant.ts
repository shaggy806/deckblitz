import { defineCard } from "../define.js";

// The permanent is a target, chosen as the trigger goes on the stack; whether to return it is the
// "may" as it resolves, and "if you do" is whether it was returned this way.
const TEXT =
  "When this creature enters, you may return another target nonland permanent you control to its owner's hand. If you do, scry 2.";

export default defineCard({
  name: "Stockpiling Celebrant",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Knight"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } } }],
      effect: {
        kind: "may",
        prompt: "Return the targeted permanent to its owner's hand?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "return-to-hand", target: 0 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "returned-to-hand" },
              then: { kind: "scry", amount: 2 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
