import { defineCard } from "../define.js";

// EDHREC rank 22103.

const DAMAGED_TEXT = "Whenever a creature an opponent controls is dealt damage, put a +1/+1 counter on Kazarov.";
const PING_TEXT = "{3}{R}: Kazarov deals 2 damage to target creature.";

export default defineCard({
  name: "Kazarov, Sengir Pureblood",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${DAMAGED_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      // Once per creature dealt damage at one time (the ruling).
      trigger: { on: "dealt-damage", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DAMAGED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
