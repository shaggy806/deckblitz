import { defineCard } from "../define.js";

// EDHREC rank 11473. March of the Machine.
//
// Rulings:
//   [2023-04-14] For the second mode, the Incubator token is chosen as Sunder the Gateway
//     resolves. You can transform the Incubator token you just created or one you already
//     controlled.
//   [2023-04-14] For the first mode, if the nontoken artifact or enchantment is an illegal target
//     at the time Sunder the Gateway tries to resolve, it won't resolve and none of its effects
//     will happen. You won't incubate.
//
// The second mode's Incubator is chosen, not targeted, after the incubate
// (`choose-permanents`, exactly one while there is one). A transformed
// Incubator is a Phyrexian, no longer an Incubator, so it isn't offered.

export default defineCard({
  name: "Sunder the Gateway",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Choose one —\n• Destroy target nontoken artifact or enchantment an opponent controls. Incubate 2. (Create an Incubator token with two +1/+1 counters on it and \"{2}: Transform this token.\" It transforms into a 0/0 Phyrexian artifact creature.)\n• Incubate 2, then transform an Incubator token you control.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target nontoken artifact or enchantment an opponent controls. Incubate 2.",
        targets: [
          { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "enchantment"], token: false } },
        ],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "incubate", amount: 2 },
          ],
        },
      },
      {
        text: "Incubate 2, then transform an Incubator token you control.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "incubate", amount: 2 },
            {
              kind: "choose-permanents",
              filter: { subtype: "Incubator", token: true, controlledBy: "you" },
              min: 1,
              upTo: 1,
              then: { kind: "transform", target: 0 },
              prompt: "Transform an Incubator token you control",
            },
          ],
        },
      },
    ],
  },
});
