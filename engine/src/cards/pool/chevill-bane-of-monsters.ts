import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, if your opponents control no permanents with bounty counters on them, put a bounty counter on target creature or planeswalker an opponent controls.";
const DIES_TEXT =
  "Whenever a permanent an opponent controls with a bounty counter on it dies, you gain 3 life and draw a card.";

const WITH_BOUNTY = { counters: { kind: "bounty", compare: { op: "gte", n: 1 } } } as const;

export default defineCard({
  name: "Chevill, Bane of Monsters",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${UPKEEP_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      // Any bounty counter on any opponent's permanent, not just this
      // Chevill's (its ruling).
      condition: { kind: "not", of: { kind: "opponents-control-total", filter: WITH_BOUNTY, atLeast: 1 } },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["creature", "planeswalker"] },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "bounty", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "dies", who: "opponent", filter: WITH_BOUNTY },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
