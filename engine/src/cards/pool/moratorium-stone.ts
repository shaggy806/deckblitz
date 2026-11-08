import { defineCard } from "../define.js";

// The graveyards' first, one move, then the battlefield's: the target's name
// is read in exile by then (rule 201.2a).

const EXILE_ONE = "{2}, {T}: Exile target card from a graveyard.";
const EXILE_ALL =
  "{2}{W}{B}, {T}, Sacrifice this artifact: Exile target nonland card from a graveyard, all other cards from graveyards with the same name as that card, and all permanents with that name.";

export default defineCard({
  name: "Moratorium Stone",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${EXILE_ONE}\n${EXILE_ALL}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: EXILE_ONE,
    },
    {
      cost: { mana: "{2}{W}{B}", tap: true, sacrifice: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { notTypes: ["land"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: "each-player", filter: { sameNameWith: 0 } },
          { kind: "exile-all", filter: { sameNameWith: 0 } },
        ],
      },
      resolve: null,
      text: EXILE_ALL,
    },
  ],
});
