import { defineCard } from "../define.js";

const TEXT =
  "If damage would be dealt to this creature, prevent that damage. When damage is prevented this way, this creature deals that much damage to any other target.";

export default defineCard({
  name: "Phyrexian Vindicator",
  manaCost: "{W}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        to: "self",
        instead: {
          prevent: true,
          perEvent: true,
          then: {
            kind: "reflexive-trigger",
            targets: [{ kind: "other", of: "any-target" }],
            value: "x",
            effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
            text: "When damage is prevented this way, this creature deals that much damage to any other target.",
          },
        },
      },
      text: TEXT,
    },
  ],
});
