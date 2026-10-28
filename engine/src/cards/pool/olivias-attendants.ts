import { defineCard } from "../define.js";

// Once per damage event for the total (no recipient named — rule 603.2c): a
// trampler's damage to its blocker and the player is one trigger.
const BLOOD_TEXT =
  "Whenever this creature deals damage, create that many Blood tokens. (They're artifacts with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")";
const PING_TEXT = "{2}{R}: This creature deals 1 damage to any target.";

export default defineCard({
  name: "Olivia's Attendants",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 6,
  toughness: 6,
  keywords: ["menace"],
  text: `Menace\n${BLOOD_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: { triggerValue: true } },
      resolve: null,
      text: BLOOD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
