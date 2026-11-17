import { defineCard } from "../define.js";

// Final Fantasy Commander (FIC). EDHREC rank 11898.
//
// Comeuppance's shape: two prevention rules over you, split by whether the
// source is a creature as the damage would be dealt (rule 615.1) — disjoint,
// so together they prevent exactly what the card's one rule does. "Whenever
// damage from a creature is prevented this way" is a triggered ability the
// spell's resolution created (rule 603.7a), not prevention's additional
// effect (615.5): the creature rule's `then` is a `reflexive-trigger`, which
// triggers each time that rule prevents damage — per source, so two attacking
// creatures prevented make two triggers — and uses the stack, with the
// damage's source as its trigger object ("that creature"). Each commander
// creature you control is read as it resolves (608.2h); nothing is dealt
// once that creature has left the battlefield.

const TRIGGER =
  "Whenever damage from a creature is prevented this way, each commander creature you control deals damage equal to its power to that creature.";

export default defineCard({
  name: "Judgment of Alexander",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Prevent all damage that would be dealt to you this turn by sources your opponents control. ${TRIGGER}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "damage-rule",
        to: { players: "you" },
        by: { filter: { type: "creature", controlledBy: "opponent" } },
        then: {
          kind: "reflexive-trigger",
          targets: [],
          effect: {
            kind: "each-deals-damage",
            filter: { type: "creature", isCommander: true, controlledBy: "you" },
            amount: "its-power",
            to: "trigger-object",
          },
          text: TRIGGER,
        },
      },
      {
        kind: "damage-rule",
        to: { players: "you" },
        by: { filter: { notTypes: ["creature"], controlledBy: "opponent" } },
      },
    ],
  },
});
