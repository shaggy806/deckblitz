import { defineCard } from "../define.js";

const ISLAND = "This creature can't attack unless defending player controls an Island.";
const BONUS =
  "Whenever this creature blocks or becomes blocked by a creature that has been dealt damage this turn, this creature gets +2/+0 and gains trample until end of turn.";
const SACRIFICE = "When you control no Islands, sacrifice this creature.";

// Once for each such creature, judged as blocks are declared: one damaged
// only later doesn't count (the rulings).
const PUMP = {
  kind: "sequence",
  effects: [
    { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
    { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
  ],
} as const;

export default defineCard({
  name: "Giant Shark",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shark"],
  power: 4,
  toughness: 4,
  text: `${ISLAND}\n${BONUS}\n${SACRIFICE}`,
  static: [{ affects: { scope: "self" }, restrictions: [{ kind: "cant-attack", unlessDefender: { controls: { subtype: "Island" } } }], text: ISLAND }],
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { damagedThisTurnBy: {} } },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: BONUS,
    },
    {
      trigger: { on: "blocked-by", who: "self", blocker: { damagedThisTurnBy: {} } },
      sameAbilityAs: 0,
      targets: [],
      effect: PUMP,
      resolve: null,
      text: BONUS,
    },
    {
      trigger: { on: "state", state: { kind: "not", of: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 } } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SACRIFICE,
    },
  ],
});
