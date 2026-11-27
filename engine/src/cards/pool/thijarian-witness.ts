import { defineCard } from "../define.js";

// Doctor Who. EDHREC rank 23399. "If it was attacking or blocking alone"
// (rule 506.5) is read of the creature as it last existed (603.10a): the
// `attackingAlone` / `blockingAlone` clauses on its snapshot, taken before
// anything in the same event moved — two attackers dying together weren't
// alone. Intervening if (603.4), so it's asked again as it resolves, of the
// same snapshot. "Exile it" finds the card only while it's still in the
// graveyard (400.7); the Clue is made either way.

const TEXT =
  "Bear Witness — Whenever another creature dies, if it was attacking or blocking alone, exile it and investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Thijarian Witness",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Alien", "Cleric"],
  power: 0,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      condition: { kind: "trigger-object", filter: { anyOf: [{ attackingAlone: true }, { blockingAlone: true }] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          { kind: "create-token", token: "Clue Token", investigate: true, count: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
