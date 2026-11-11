import { defineCard } from "../define.js";

// EDHREC rank 7956. The entering permanent's controller chooses the target as
// the ability goes on the stack (rule 603.3d); the exchange isn't optional, and
// it needs both still there and still sharing a type (the rulings). It
// triggers on itself entering too.
const TEXT =
  "Whenever an artifact, creature, or enchantment enters, its controller chooses target permanent another player controls that shares a card type with it. Exchange control of those permanents.";

export default defineCard({
  name: "Confusion in the Ranks",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } },
      targetsChosenBy: "trigger-object-controller",
      // "Another player": anyone but the chooser, the entering permanent's controller.
      targets: [
        {
          kind: "permanent",
          whose: "any",
          filter: { sharesCardTypeWith: "trigger-object", not: { controlledByRef: { controllerOf: "trigger-object" } } },
        },
      ],
      effect: { kind: "exchange-control", objects: ["trigger-object", 0] },
      resolve: null,
      text: TEXT,
    },
  ],
});
