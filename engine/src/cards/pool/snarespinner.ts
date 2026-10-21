import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 15592.
//
// "Blocks a creature with flying" is part of the trigger condition (rule
// 603.1), not an intervening "if": the blocked creature (the trigger object,
// `object: "blocked"`) is asked as the block is declared, and the flier losing
// flying afterwards doesn't stop the pump (`whileCondition`).

const TEXT = "Whenever this creature blocks a creature with flying, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Snarespinner",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { keyword: "flying" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
