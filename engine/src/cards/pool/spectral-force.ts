import { defineCard } from "../define.js";

// An attack trigger's "that player" is the defending player; the intervening-if
// (rule 603.4) is asked as it attacks and again as it resolves. "Your next untap
// step" is the step of whoever controls it as this resolves (the ruling).

const TEXT = "Whenever this creature attacks, if defending player controls no black permanents, it doesn't untap during your next untap step.";

export default defineCard({
  name: "Spectral Force",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Spirit"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: {
        kind: "of-player",
        player: "that-player",
        condition: { kind: "not", of: { kind: "controls", filter: { colors: ["B"] }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true, untapStepOf: "you" },
      resolve: null,
      text: TEXT,
    },
  ],
});
