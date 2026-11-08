import { defineCard } from "../define.js";

const ATTACK = "This creature can't attack unless defending player controls an Island.";
const MONSTROSITY = "{5}{U}{U}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)";
const ISLAND = "When this creature becomes monstrous, target land becomes an Island in addition to its other types.";

export default defineCard({
  name: "Sealock Monster",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus"],
  power: 5,
  toughness: 5,
  text: `${ATTACK}\n${MONSTROSITY}\n${ISLAND}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-attack", unlessDefender: { controls: { subtype: "Island" } } }],
      text: ATTACK,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: MONSTROSITY,
    },
  ],
  triggered: [
    {
      trigger: { on: "event", event: "becomes-monstrous", who: "self" },
      targets: ["land"],
      effect: { kind: "add-types", target: 0, addSubtypes: ["Island"], duration: "permanent" },
      resolve: null,
      text: ISLAND,
    },
  ],
});
