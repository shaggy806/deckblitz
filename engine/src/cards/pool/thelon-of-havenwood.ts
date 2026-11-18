import { defineCard } from "../define.js";

// EDHREC rank 14598. "Each Fungus creature" and "each Fungus on the
// battlefield" are everyone's, not only yours. "Exile a Fungus card from a
// graveyard" may take one from any player's graveyard, chosen as the cost is
// paid (rules 602.2b, 601.2h): `exileFromGraveyard`'s `singleGraveyard` at a
// count of one.
//
// Rulings:
//   [2021-03-19] Because damage remains marked on a creature until the damage is removed as the turn
//     ends, nonlethal damage dealt to a Fungus creature may become lethal if Thelon leaves the
//     battlefield during that turn or if spore counters are removed from the Fungus during that turn.

const PT_TEXT = "Each Fungus creature gets +1/+1 for each spore counter on it.";
const SPORE_TEXT = "{B}{G}, Exile a Fungus card from a graveyard: Put a spore counter on each Fungus on the battlefield.";

export default defineCard({
  name: "Thelon of Havenwood",
  manaCost: "{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 2,
  text: `${PT_TEXT}\n${SPORE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Fungus" } },
      grantPtPerCount: { countersOnAffected: "spore", pt: [1, 1] },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{B}{G}",
        tap: false,
        exileFromGraveyard: { count: 1, filter: { subtype: "Fungus" }, singleGraveyard: true },
      },
      targets: [],
      effect: { kind: "add-counter-all", filter: { subtype: "Fungus" }, counter: "spore", amount: 1 },
      resolve: null,
      text: SPORE_TEXT,
    },
  ],
});
