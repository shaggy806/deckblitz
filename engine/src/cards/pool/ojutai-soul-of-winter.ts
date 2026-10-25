import { defineCard } from "../define.js";

// Junk Winder's shape: tap, and it doesn't untap during its controller's next
// untap step (a target already tapped is still held — the ruling).

const TRIGGER_TEXT =
  "Whenever a Dragon you control attacks, tap target nonland permanent an opponent controls. That permanent doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Ojutai, Soul of Winter",
  manaCost: "{5}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 6,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtype: "Dragon" } },
      targets: [{ kind: "permanent", filter: { notTypes: ["land"], controlledBy: "opponent" } }],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
