import { defineCard } from "../define.js";

// The opponent the caster names chooses the mode as it's cast
// (`castModal.chosenBy`, rule 700.2e); the second mode's targets are the
// caster's, chosen after (601.2c), among the creatures of the opponent who
// chose (`controlledBy: "chooser"`), who is "that player" as it resolves.
export default defineCard({
  name: "Fatal Lore",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "An opponent chooses one —\n" +
    "• You draw three cards.\n" +
    "• You destroy up to two target creatures that player controls. They can't be regenerated. That player draws up to three cards.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    chosenBy: "opponent",
    modes: [
      {
        text: "You draw three cards.",
        effect: { kind: "draw", amount: 3 },
      },
      {
        text: "You destroy up to two target creatures that player controls. They can't be regenerated. That player draws up to three cards.",
        targets: [
          { kind: "any-number", of: { kind: "permanent", filter: { type: "creature", controlledBy: "chooser" } }, max: 2 },
        ],
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "for-each-target",
              from: 0,
              simultaneous: true,
              effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
            },
            {
              kind: "choose-value",
              value: "number",
              who: "that-player",
              min: 0,
              max: 3,
              prompt: "How many cards do you draw?",
              then: { kind: "draw", amount: "x", who: "that-player" },
            },
          ],
        },
      },
    ],
  },
});
