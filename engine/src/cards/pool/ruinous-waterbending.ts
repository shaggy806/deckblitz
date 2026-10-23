import { defineCard } from "../define.js";

// EDHREC rank 16290.
// "You may waterbend {4}" is an optional additional cost (rule 601.2b), a
// kicker by another name (Katara, Seeking Revenge): paid, the spell also sets
// up a delayed triggered ability for the rest of the turn (rule 603.7c) —
// every creature that dies this turn, the ones this -2/-2 kills included,
// gains you 1 life.

export default defineCard({
  name: "Ruinous Waterbending",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  kicker: {
    cost: "{4}",
    keyword: "waterbend",
    effect: {
      kind: "sequence",
      effects: [
        {
          kind: "modify-pt-all",
          filter: { type: "creature" },
          power: -2,
          toughness: -2,
          duration: "end-of-turn",
        },
        {
          kind: "delayed-trigger",
          at: { whenever: { on: "dies", who: "any", filter: { type: "creature" } } },
          effect: { kind: "gain-life", amount: 1 },
          text: "Whenever a creature dies this turn, you gain 1 life.",
        },
      ],
    },
  },
  text: "As an additional cost to cast this spell, you may waterbend {4}. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)\nAll creatures get -2/-2 until end of turn. If this spell's additional cost was paid, whenever a creature dies this turn, you gain 1 life.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: -2,
    toughness: -2,
    duration: "end-of-turn",
  },
});
