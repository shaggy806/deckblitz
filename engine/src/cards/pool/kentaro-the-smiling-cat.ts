import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

// Betrayers of Kamigawa (BOK). EDHREC rank 18322.
//
// An alternative cost for the Samurai spells its controller casts (rule
// 118.9): {N} generic, N the mana value of the spell it would be
// (`manaIsManaValue`; an {X} in its cost counted as 0, rule 107.3b). Beside
// another alternative cost the caster picks which.

const TEXT = "You may pay {X} rather than pay the mana cost for Samurai spells you cast, where X is that spell's mana value.";

export default defineCard({
  name: "Kentaro, the Smiling Cat",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 1,
  text: `Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)\n${TEXT}`,
  triggered: [...bushido(1)],
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: { mana: "{X}", manaIsManaValue: true, filter: { subtype: "Samurai" } },
      text: TEXT,
    },
  ],
});
