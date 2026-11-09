import { defineCard } from "../define.js";

// EDHREC rank 13718. "Until **that player's** next turn" is the player
// effect's duration anchored to the target (`{ untilTurnOf: "that-player" }`
// inside a `for-each-player` over it): it ends as their turn begins, and
// their permanents phase in during that turn's untap step as phasing always
// does (rule 702.26), so a skipped untap step leaves them out a while longer
// (the ruling).
export default defineCard({
  name: "Teferi's Reproach",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose target opponent. Until that player's next turn, they gain protection from everything and their life total can't change. All nonland permanents they control phase out. (While they're phased out, they're treated as though they don't exist. They phase in before that player untaps during their next untap step.)\nExile Teferi's Reproach.",
  targets: ["opponent"],
  exileOnResolve: true,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: { target: 0 },
        effect: { kind: "sequence", effects: [{ kind: "player-effect", duration: { untilTurnOf: "that-player" }, protectionFromEverything: "that-player" }, { kind: "prohibit", prohibits: [{ act: "change-life", who: "that-player" }], duration: { untilTurnOf: "that-player" } }] },
      },
      { kind: "phase-out", filter: { notTypes: ["land"], controlledBy: "you" }, controlledByTarget: 0 },
    ],
  },
});
