import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 15568.
//
// Two kicker costs, each payable once (rule 702.33b): kicked twice only with
// {U}{B}. The mill is part of the replacement as it enters (rules 614.1c,
// 614.12), not a trigger: nobody can respond, and the creature enters seeing
// the cards it milled (the rulings). Its power and toughness are a
// characteristic-defining ability (604.3), counted in every zone.
const MILL_TEXT = "As this creature enters, mill three cards for each time it was kicked.";
const PT_TEXT =
  "Urborg Lhurgoyf's power is equal to the number of creature cards in your graveyard and its toughness is equal to that number plus 1.";

export default defineCard({
  name: "Urborg Lhurgoyf",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 1,
  text: `Kicker {U} and/or {B} (You may pay an additional {U} and/or {B} as you cast this spell.)\n${MILL_TEXT}\n${PT_TEXT}`,
  kicker: { cost: "{U}", second: "{B}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: { mill: { product: [3, { timesKicked: "source" }] } },
      },
      text: MILL_TEXT,
    },
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 1,
      },
      text: PT_TEXT,
    },
  ],
});
