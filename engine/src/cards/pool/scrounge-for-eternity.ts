import { defineCard } from "../define.js";

// EDHREC rank 12062.
// Makes Lander → use "Lander Token".
//
// Rulings:
//   [2025-07-25] If a card in your graveyard has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.

const RETURN_TEXT =
  "Return target creature or Spacecraft card with mana value 5 or less from your graveyard to the battlefield. Then create a Lander token.";

// The target is chosen before the sacrifice is paid (rule 601.2c, 601.2h), so
// the creature sacrificed can't be the one returned. Its one target illegal,
// the spell doesn't resolve and no Lander is made (rule 608.2b).
export default defineCard({
  name: "Scrounge for Eternity",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `As an additional cost to cast this spell, sacrifice an artifact or creature.\n${RETURN_TEXT} (It's an artifact with "{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.")`,
  additionalCost: { sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "you",
      filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }], manaValue: { op: "lte", n: 5 } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "create-token", token: "Lander Token", count: 1 },
    ],
  },
});
