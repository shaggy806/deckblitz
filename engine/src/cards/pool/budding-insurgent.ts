import { defineCard } from "../define.js";

// EDHREC rank 28125.
//
// "If that permanent was a legendary enchantment" asks about the target, not
// about whether it was destroyed: one gone to the graveyard is read as it
// last existed on the battlefield (rule 608.2h), an indestructible one as it
// is.

const SAC_TEXT =
  "Sacrifice this creature: Destroy target artifact or enchantment. If that permanent was a legendary enchantment, draw a card. Activate only as a sorcery.";

export default defineCard({
  name: "Budding Insurgent",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad", "Scout"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["artifact-or-enchantment"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "enchantment", supertype: "legendary" } },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      sorcerySpeed: true,
      text: SAC_TEXT,
    },
  ],
});
