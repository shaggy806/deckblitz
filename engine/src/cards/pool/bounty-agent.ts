import { defineCard } from "../define.js";

// EDHREC rank 7133.

const DESTROY_TEXT =
  "{T}, Sacrifice this creature: Destroy target legendary permanent that's an artifact, creature, or enchantment.";

export default defineCard({
  name: "Bounty Agent",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${DESTROY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [
        {
          kind: "permanent",
          filter: { supertype: "legendary", typesAnyOf: ["artifact", "creature", "enchantment"] },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
