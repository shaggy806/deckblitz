import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// Its power and toughness are a CDA (rule 604.3) over the set of cards exiled
// with it in this stint (rule 607.2a: its first ability's exiles, linked to
// it): none off the battlefield, none once they've left exile.
const EXILE_TEXT = "{T}: Exile up to two target cards from a single graveyard.";
const PT_TEXT = "Unlicensed Hearse's power and toughness are each equal to the number of cards exiled with it.";

export default defineCard({
  name: "Unlicensed Hearse",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 0,
  toughness: 0,
  text: `${EXILE_TEXT}\n${PT_TEXT}\n${crewText(2)}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "count", filter: {}, in: "exiled-with-source" },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 2, sameController: true }],
      effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "exile", target: 0, linked: true } },
      resolve: null,
      text: EXILE_TEXT,
    },
    crew(2, crewText(2)),
  ],
});
