import { defineCard } from "../define.js";

// Toughness is a CDA over devotion to black (Anax's shape, toughness only);
// the activated ability is Graveyard Glutton's: one exile of both targets,
// then 1 life per creature card it exiled.
const CDA_TEXT =
  "Tymaret's toughness is equal to your devotion to black. (Each {B} in the mana costs of permanents you control counts toward your devotion to black.)";
const EXILE_TEXT =
  "{1}{B}: Exile up to two target cards from graveyards. You gain 1 life for each creature card exiled this way.";

export default defineCard({
  name: "Tymaret, Chosen from Death",
  manaCost: "{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["Demigod"],
  power: 2,
  toughness: 0,
  text: `${CDA_TEXT}\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { devotionTo: ["B"] }, plusPower: 0, plusToughness: 0, only: "toughness" },
      text: CDA_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 2 }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
          { kind: "gain-life", amount: { thisWay: "exiled", filter: { type: "creature" } } },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
