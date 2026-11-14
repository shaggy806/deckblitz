import { defineCard } from "../define.js";

// EDHREC rank 23957. Two statics on itself: spells its controller casts that
// target it cost {2} less (Spellwild Ouphe's, for "you" only), and spells its
// controller's opponents cast that target it cost {2} more (Boreal
// Elemental's). Neither reaches abilities (the ruling).
const LESS = "Spells you cast that target this creature cost {2} less to cast.";
const MORE = "Spells your opponents cast that target this creature cost {2} more to cast.";

export default defineCard({
  name: "Elderwood Scion",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  keywords: ["trample", "lifelink"],
  text: `Trample, lifelink\n${LESS}\n${MORE}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, targetingSource: true, reduceGeneric: 2, when: { caster: "you" } },
      text: LESS,
    },
    {
      affects: { scope: "self" },
      targetedBySpellsCost: { payGeneric: 2 },
      text: MORE,
    },
  ],
});
