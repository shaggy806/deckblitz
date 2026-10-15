import { defineCard } from "../define.js";

// EDHREC rank 18698.
//
// Atlantis Attacks' "one or two target nonland permanents", returned as one
// event, then a Merfolk token for each permanent actually returned this way
// (a `thisWay` count — a target found illegal isn't returned and isn't
// counted), only if its controller controls a Merfolk as that step happens.

const RETURN_TEXT =
  "Return one or two target nonland permanents to their owners' hands. Then if you control a Merfolk, create a 1/1 white and blue Merfolk creature token for each permanent returned to its owner's hand this way.";

export default defineCard({
  name: "Wanderwine Farewell",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["kindred", "sorcery"],
  subtypes: ["Merfolk"],
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\n${RETURN_TEXT}`,
  targets: ["nonland-permanent", { kind: "optional", of: { kind: "other", of: "nonland-permanent", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
        ],
      },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Merfolk" }, atLeast: 1 },
        then: {
          kind: "create-token",
          token: "Merfolk Token (Silvergill Mentor)",
          count: { thisWay: "returned-to-hand" },
        },
      },
    ],
  },
});
