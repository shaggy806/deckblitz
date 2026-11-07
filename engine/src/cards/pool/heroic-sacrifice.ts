import { defineCard } from "../define.js";

const DIES_TEXT = "When that creature dies this turn, put its counters on up to one target creature you control and draw a card.";

export default defineCard({
  name: "Heroic Sacrifice",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Choose target creature you control. Until end of turn, all damage that would be dealt to you and creatures you control is dealt to the chosen creature instead (if it's still on the battlefield). " +
    DIES_TEXT,
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      // A redirection (rule 614.9) for the turn: it does nothing once the
      // chosen creature has left, and damage already going to it stays.
      {
        kind: "damage-rule",
        to: { players: "you", permanents: { type: "creature", controlledBy: "you" } },
        redirectTo: 0,
      },
      // A delayed ability with a target of its own, chosen as it triggers
      // (rule 603.7c); "its counters" are the ones it died with (608.2h).
      {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "dies", who: "self" },
          watching: 0,
          once: true,
          targets: [{ kind: "optional", of: "creature-you-control" }],
        },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "put-counters-of", of: "trigger-object", target: 0 },
            { kind: "draw", amount: 1 },
          ],
        },
        text: DIES_TEXT,
      },
    ],
  },
});
