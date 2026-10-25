import { defineCard } from "../define.js";

const CONTROL_TEXT = "You control enchanted creature.";
const MOVE_TEXT = "Whenever a creature an opponent controls enters, attach this Aura to that creature.";

// The move is mandatory and doesn't target, so hexproof or shroud doesn't
// stop it; a creature the Aura can't legally enchant (protection from blue)
// leaves it where it is, the creature it's on still yours (its rulings, rule
// 701.3b). Control follows the Aura: once it moves, the creature it left goes
// back to whoever controlled it otherwise (rule 613.1b).
export default defineCard({
  name: "Illusory Gains",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${CONTROL_TEXT}\n${MOVE_TEXT}`,
  targets: ["creature"],
  controlEnchanted: true,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "attach", target: "trigger-object" },
      resolve: null,
      text: MOVE_TEXT,
    },
  ],
});
