import { defineCard } from "../define.js";

// Once per damage event, however many it hit (the ruling; no recipient named
// — rule 603.2c). Delirium is an intervening "if" (rule 603.4).
const TEXT =
  "Delirium — Whenever this creature deals damage, if there are four or more card types among cards in your graveyard, exile target creature an opponent controls.";

export default defineCard({
  name: "Angel of Deliverance",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      condition: { kind: "delirium" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
