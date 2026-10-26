import { defineCard } from "../define.js";

const TRIGGER_TEXT = "When this creature leaves the battlefield, it deals 6 damage to target creature.";

export default defineCard({
  name: "Spitebellows",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 1,
  evoke: { cost: "{1}{R}{R}" },
  text: `${TRIGGER_TEXT}\nEvoke {1}{R}{R} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 6 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
