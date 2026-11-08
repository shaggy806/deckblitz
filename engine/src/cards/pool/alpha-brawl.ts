import { defineCard } from "../define.js";

// Dark Ascension (DKA). EDHREC rank 17787. Two steps: the target deals its
// damage to each other creature its controller controls, then each of those
// deals damage equal to its power to it — those dealt lethal damage by the
// first step too, since state-based actions wait until a player would get
// priority (rule 704.3).

export default defineCard({
  name: "Alpha Brawl",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Target creature an opponent controls deals damage equal to its power to each other creature that player controls, then each of those creatures deals damage equal to its power to that creature.",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "damage-all",
        filter: { type: "creature" },
        amount: { powerOf: 0 },
        controlledByTarget: 0,
        exceptSource: true,
        from: 0,
      },
      {
        kind: "each-deals-damage",
        filter: { type: "creature" },
        amount: "its-power",
        to: 0,
        controlledByTarget: 0,
        exceptTarget: 0,
      },
    ],
  },
});
