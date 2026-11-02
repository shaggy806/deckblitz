import { defineCard } from "../define.js";

// Homelands. An attack trigger's "that player" is the defending player; the
// intervening-if (rule 603.4) is asked as it attacks and again as it resolves.

const TEXT =
  "Whenever this creature attacks, if defending player controls no black nontoken permanents, it doesn't untap during your next untap step.";

export default defineCard({
  name: "Spectral Bears",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear", "Spirit"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: {
        kind: "of-player",
        player: "that-player",
        condition: { kind: "not", of: { kind: "controls", filter: { colors: ["B"], token: false }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true, untapStepOf: "you" },
      resolve: null,
      text: TEXT,
    },
  ],
});
