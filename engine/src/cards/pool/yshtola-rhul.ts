import { defineCard } from "../define.js";

// Rulings:
//   Additional end steps don't come with any other additional steps (such as cleanup). Damage
//     marked on permanents won't be removed until you actually get to the cleanup step (which
//     will happen after your second end step), and "until end of turn" and "this turn" effects
//     won't end until the cleanup step either.
//   Abilities that trigger "at the beginning of [your/the] end step" will trigger at the
//     beginning of each of your additional end steps as well.
//   If the target creature is an illegal target as Y'shtola Rhul's ability tries to resolve, it
//     won't resolve and none of its effects will happen. There won't be an additional end step.
//   A delayed triggered ability that triggers "at the beginning of the next end step" created
//     during your first end step will trigger during your second end step.

const TEXT =
  "At the beginning of your end step, exile target creature you control, then return it to the battlefield under its owner's control. Then if it's the first end step of the turn, there is an additional end step after this step.";

export default defineCard({
  name: "Y'shtola Rhul",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Druid"],
  power: 3,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "flicker", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "turn-structure", endStep: 1 },
            then: { kind: "additional-end-step" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
