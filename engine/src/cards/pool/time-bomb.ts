import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 20767.
//
// The count is the artifact's as it was sacrificed (last-known information,
// rule 608.2h) — every creature and every player is dealt it at once.

const UPKEEP_TEXT = "At the beginning of your upkeep, put a time counter on this artifact.";
const BOMB_TEXT =
  "{1}, {T}, Sacrifice this artifact: This artifact deals damage equal to the number of time counters on it to each creature and each player.";

const TIME = { countersOn: "source", counter: "time" } as const;

export default defineCard({
  name: "Time Bomb",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${UPKEEP_TEXT}\n${BOMB_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: TIME },
          { kind: "damage", amount: TIME, who: "each-player" },
        ],
      },
      resolve: null,
      text: BOMB_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
