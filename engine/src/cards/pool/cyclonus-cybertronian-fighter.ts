import { defineCard } from "../define.js";

// Back face. "Convert it. If you do" is the `this-way` transformed condition
// (701.28f): it didn't if it had left or converted since. The beginning
// phase comes after the combat phase under way, then the postcombat main
// phase (rule 500.8).
const TRIGGER_TEXT =
  "Whenever Cyclonus deals combat damage to a player, convert it. If you do, there is an additional beginning phase after this phase. (The beginning phase includes the untap, upkeep, and draw steps.)";

export default defineCard({
  name: "Cyclonus, Cybertronian Fighter",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Living metal (During your turn, this Vehicle is also a creature.)\nFlying\n${TRIGGER_TEXT}`,
  static: [
    { affects: { scope: "self" }, condition: { kind: "your-turn" }, addTypes: ["creature"], text: "Living metal" },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "transform", target: "source" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "transformed" },
            then: { kind: "additional-beginning-phase" },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  faces: ["Cyclonus, the Saboteur", "Cyclonus, Cybertronian Fighter"],
});
