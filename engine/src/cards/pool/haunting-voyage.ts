import { defineCard } from "../define.js";

// EDHREC rank 3718. Nothing is targeted: the type is chosen as it resolves,
// then up to two cards of it (or, foretold, all of them — the spell's own
// `castVia`, Poison the Cup's shape).

export default defineCard({
  name: "Haunting Voyage",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  foretell: { cost: "{5}{B}{B}" },
  text: "Choose a creature type. Return up to two creature cards of that type from your graveyard to the battlefield. If this spell was foretold, return all creature cards of that type from your graveyard to the battlefield instead.\nForetell {5}{B}{B} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  targets: [],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "conditional",
      condition: { kind: "source", filter: { castVia: "foretell" } },
      then: {
        kind: "return-from-graveyard",
        filter: { type: "creature", subtype: "$chosen" },
        destination: "battlefield",
        count: "all",
      },
      else: {
        kind: "return-from-graveyard",
        filter: { type: "creature", subtype: "$chosen" },
        destination: "battlefield",
        count: 2,
        upTo: true,
      },
    },
  },
});
