import { defineCard } from "../define.js";

const NO_UNTAP = "This creature doesn't untap during your untap step.";
const UNTAP = "{U}{U}, Sacrifice a creature: Untap this creature. Activate only during your upkeep.";
const ATTACK = "This creature can't attack unless defending player controls an Island.";
const PING = "{U}{U}: This creature gets -1/-0 until end of turn and deals 1 damage to target attacking creature without flying.";
const SACRIFICE = "When you control no Islands, sacrifice this creature.";

export default defineCard({
  name: "Marjhan",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 8,
  toughness: 8,
  text: `${NO_UNTAP}\n${UNTAP}\n${ATTACK}\n${PING}\n${SACRIFICE}`,
  static: [
    { affects: { scope: "self" }, doesntUntap: true, text: NO_UNTAP },
    { affects: { scope: "self" }, cantAttackUnlessDefender: { controls: { subtype: "Island" } }, text: ATTACK },
  ],
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false, sacrifice: "creature-you-control" },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP,
    },
    {
      cost: { mana: "{U}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, notKeyword: "flying" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: -1, toughness: 0, duration: "end-of-turn" },
          { kind: "damage", amount: 1, target: 0 },
        ],
      },
      resolve: null,
      text: PING,
    },
  ],
  triggered: [
    {
      trigger: { on: "state", state: { kind: "not", of: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 } } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SACRIFICE,
    },
  ],
});
