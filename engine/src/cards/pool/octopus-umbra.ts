import { defineCard } from "../define.js";

// EDHREC rank 10063.

const GRANT_TEXT =
  'Enchanted creature has base power and toughness 8/8 and has "Whenever this creature attacks, you may tap target creature with power 8 or less."';

export default defineCard({
  name: "Octopus Umbra",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: `Enchant creature\n${GRANT_TEXT}\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)`,
  targets: ["creature"],
  static: [
    {
      // The granted trigger is the creature's, so "you" is its controller.
      affects: { scope: "attached" },
      setBasePt: { power: 8, toughness: 8 },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 8 } } }],
          effect: { kind: "may", prompt: "Tap that creature?", effect: { kind: "tap", target: 0 } },
          resolve: null,
          text: "Whenever this creature attacks, you may tap target creature with power 8 or less.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
