import { defineCard } from "../define.js";

// The back face of Invasion of Fiora. "Since your last turn" is the journal's
// window from the end of your last turn to now, this upkeep included.
const ATTACK_TEXT = "Whenever Marchesa attacks, remove all counters from up to one target permanent.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if you haven't been dealt combat damage since your last turn, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Marchesa, Resolute Monarch",
  art: "https://cards.scryfall.io/art_crop/back/b/3/b3af679b-6ee6-4a1d-8ec3-b659bdd90b4a.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 3,
  toughness: 6,
  keywords: ["menace", "deathtouch"],
  text: `Menace, deathtouch\n${ATTACK_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: "permanent" }],
      effect: { kind: "remove-counter", target: 0, counter: "any", amount: "all" },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "not",
        of: { kind: "turn-history", what: "combat-damaged-by", window: "since-your-last-turn", who: "you" },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Invasion of Fiora", "Marchesa, Resolute Monarch"],
  transform: true,
});
