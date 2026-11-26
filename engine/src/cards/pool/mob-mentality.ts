import { defineCard } from "../define.js";

// "All non-Wall creatures you control attack": fires once per declaration in
// which every non-Wall creature its controller controls is an attacker (rule
// 508.1), none left home. X is every attacking creature as it resolves, any
// player's — the text says "attacking creatures", not "you control".
const TRIGGER_TEXT =
  "Whenever all non-Wall creatures you control attack, enchanted creature gets +X/+0 until end of turn, where X is the number of attacking creatures.";

export default defineCard({
  name: "Mob Mentality",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has trample.\n${TRIGGER_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["trample"],
      text: "Enchanted creature has trample.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", allOf: { notSubtypes: ["Wall"] } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "attached",
        power: { countOf: { type: "creature", attacking: true } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
