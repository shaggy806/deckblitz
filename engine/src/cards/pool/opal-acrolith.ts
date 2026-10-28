import { defineCard } from "../define.js";

// EDHREC rank 30688. Rulings: as a creature it's no longer an enchantment, and
// as an enchantment no longer a creature (each replaces its card types, rule
// 205.1a — the later one wins, 613.7); it triggers on the cast, countered or not.

const TRIGGER_TEXT =
  "Whenever an opponent casts a creature spell, if this permanent is an enchantment, it becomes a 2/4 Soldier creature.";
const ENCHANTMENT_TEXT = "{0}: This permanent becomes an enchantment.";

export default defineCard({
  name: "Opal Acrolith",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${TRIGGER_TEXT}\n${ENCHANTMENT_TEXT}`,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: { kind: "add-types", target: "source", setTypes: ["enchantment"], duration: "permanent" },
      resolve: null,
      text: ENCHANTMENT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "creature" } },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 4,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Soldier"],
        duration: "permanent",
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
