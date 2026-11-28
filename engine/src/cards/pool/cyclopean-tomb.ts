import { defineCard } from "../define.js";

// EDHREC rank 29539. Which lands "this artifact" put a mire counter on, and
// which it has cleared, is the journal's whole-game `countersPutBy`, keyed by
// the Tomb in its battlefield stint: the delayed ability, fired with the
// Tomb in the graveyard, reads and adds to the same record (rule 608.2h).
// Its ruling: the counters removed are all the land's mire counters,
// wherever they came from. The Swamp effect isn't tied to the Tomb (its
// ruling): it lasts for as long as the land has a mire counter.

const MIRE_TEXT =
  "{2}, {T}: Put a mire counter on target non-Swamp land. That land is a Swamp for as long as it has a mire counter on it. Activate only during your upkeep.";
const TOMB_TEXT =
  "When this artifact is put into a graveyard from the battlefield, at the beginning of each of your upkeeps for the rest of the game, remove all mire counters from a land that a mire counter was put onto with this artifact but that a mire counter has not been removed from with this artifact.";
const UPKEEP_TEXT =
  "At the beginning of each of your upkeeps for the rest of the game, remove all mire counters from a land that a mire counter was put onto with this artifact but that a mire counter has not been removed from with this artifact.";

export default defineCard({
  name: "Cyclopean Tomb",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${MIRE_TEXT}\n${TOMB_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "land", notSubtypes: ["Swamp"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "mire", amount: 1 },
          { kind: "become", target: 0, setSubtypes: ["Swamp"], duration: { whileCounter: "mire" } },
        ],
      },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      resolve: null,
      text: MIRE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "step-begins", step: "upkeep", who: "you" },
          until: "permanent",
        },
        effect: {
          kind: "choose-permanents",
          filter: { type: "land", countersPutBySource: { counter: "mire", removed: false } },
          min: 1,
          upTo: 1,
          then: { kind: "remove-counter", target: 0, counter: "mire", amount: "all" },
          prompt: "Remove all mire counters from a land Cyclopean Tomb put one on",
        },
        text: UPKEEP_TEXT,
      },
      resolve: null,
      text: TOMB_TEXT,
    },
  ],
});
