import { defineCard } from "../define.js";

// Nemesis (NEM). Fading 4 (rule 702.32) as its two pieces, Ancient Hydra's.
// "That player taps … for each fade counter" is the upkeep's player
// choosing exactly that many (all of them, with fewer): a `choose-permanents`
// with that player as `chooser`, the count read as it resolves. Tangle Wire
// itself is one they may tap.

const FADING = "Fading 4";
const FADING_UPKEEP =
  "(This artifact enters with four fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)";
const TAP =
  "At the beginning of each player's upkeep, that player taps an untapped artifact, creature, or land they control for each fade counter on this artifact.";

const FADE_COUNTERS = { countersOn: "source", counter: "fade" } as const;

export default defineCard({
  name: "Tangle Wire",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${FADING} ${FADING_UPKEEP}\n${TAP}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fade", amount: 4 } },
      text: FADING,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "fade", compare: { op: "gte", n: 1 } },
        then: { kind: "remove-counter", target: "source", counter: "fade", amount: 1 },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: FADING_UPKEEP,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        chooser: "active-player",
        filter: { typesAnyOf: ["artifact", "creature", "land"], controlledBy: "you", tapped: false },
        min: FADE_COUNTERS,
        upTo: FADE_COUNTERS,
        then: { kind: "tap", target: 0 },
        prompt: "Tap an untapped artifact, creature, or land you control for each fade counter on Tangle Wire",
      },
      resolve: null,
      text: TAP,
    },
  ],
});
