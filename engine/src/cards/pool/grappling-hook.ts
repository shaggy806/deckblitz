import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 10115. "It" is the creature that attacked — the
// trigger object — whatever happens to the Hook afterwards (the ruling).

const TRIGGER = "Whenever equipped creature attacks, you may have target creature block it this turn if able.";

export default defineCard({
  name: "Grappling Hook",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature has double strike.\n${TRIGGER}\nEquip {4}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {4}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature block the equipped creature this turn if able?",
        effect: { kind: "block-if-able", target: 0, attacker: "trigger-object" },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["double-strike"],
      text: "Equipped creature has double strike.",
    },
  ],
});
