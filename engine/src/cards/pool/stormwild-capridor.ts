import { defineCard } from "../define.js";

const PREVENT_TEXT =
  "If noncombat damage would be dealt to this creature, prevent that damage. Put a +1/+1 counter on this creature for each 1 damage prevented this way.";

export default defineCard({
  name: "Stormwild Capridor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Goat"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: false,
        prevent: true,
        to: "self",
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
      },
      text: PREVENT_TEXT,
    },
  ],
});
