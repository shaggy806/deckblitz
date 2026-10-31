import { defineCard } from "../define.js";

// Aetherdrift Commander. The eight {E} is an `alternativeCostForSpells` paid
// in energy, offered while the caster has eight: an alternative cost, so no
// other goes with it, additional costs may still be paid, and an {X} in the
// spell's cost is 0 (rules 118.9a, 118.9d, 107.3b). "Permanent spells" are
// every spell but instants and sorceries.
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, you get {E}{E} (two energy counters).";
const ALT_TEXT = "You may pay eight {E} rather than pay the mana cost for permanent spells you cast.";

export default defineCard({
  name: "Nissa, Worldsoul Speaker",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 3,
  text: `${LANDFALL_TEXT}\n${ALT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: { mana: "{0}", energy: 8, filter: { notTypes: ["instant", "sorcery"] } },
      text: ALT_TEXT,
    },
  ],
});
