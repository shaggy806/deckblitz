import { defineCard } from "../define.js";

// EDHREC rank 13279.
//
// The last ability works only while Prison Term is on the battlefield, and
// may move it off the creature it's enchanting (its ruling).

const ATTACH_TEXT = "Whenever a creature an opponent controls enters, you may attach this Aura to that creature.";

export default defineCard({
  name: "Prison Term",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature can't attack or block, and its activated abilities can't be activated.\n${ATTACH_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "any",
        filter: { type: "creature", controlledBy: "opponent" },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Attach Prison Term to that creature?",
        effect: { kind: "attach", target: "trigger-object" },
      },
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted creature can't attack or block, and its activated abilities can't be activated.",
    },
  ],
});
