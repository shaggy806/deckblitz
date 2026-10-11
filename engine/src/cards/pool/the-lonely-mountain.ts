import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

// EDHREC rank 7733.
// Makes Dwarf → "2/2 Red Dwarf Token".
//
// "Costs {1} less for each Equipment you control" comes off the generic part
// only (rule 601.2f, Voldaren Estate's `costReduction`), so it never goes
// below {R}.

const TAPPED_TEXT = "This land enters tapped unless you control an Equipment.";
const DWARF_TEXT =
  "{4}{R}, {T}: Create a 2/2 red Dwarf creature token. This ability costs {1} less to activate for each Equipment you control. Activate only as a sorcery.";

export default defineCard({
  name: "The Lonely Mountain",
  colors: [],
  types: ["land"],
  subtypes: ["Mountain"],
  text: `({T}: Add {R}.)\n${TAPPED_TEXT}\n${DWARF_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "controls", filter: { subtype: "Equipment" }, atLeast: 1 },
      },
      text: TAPPED_TEXT,
    },
  ],
  activated: [
    manaTapAbility("R"),
    {
      cost: { mana: "{4}{R}", tap: true },
      costReduction: {
        reduceGeneric: { countOf: { subtype: "Equipment", controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "create-token", token: "2/2 Red Dwarf Token", count: 1 },
      resolve: null,
      text: DWARF_TEXT,
      sorcerySpeed: true,
    },
  ],
});
