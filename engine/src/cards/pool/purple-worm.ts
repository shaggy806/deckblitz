import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 21125. Never more than {2} less, however many creatures died (its ruling).
export default defineCard({
  name: "Purple Worm",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Worm"],
  power: 8,
  toughness: 7,
  text: "This spell costs {2} less to cast if a creature died this turn.\nWard {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)",
  selfCostReduction: { condition: { kind: "creature-died-this-turn" }, reduceGeneric: 2 },
  triggered: [ward({ mana: "{2}" })],
});
