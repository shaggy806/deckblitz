import { defineCard } from "../define.js";

// EDHREC rank 1427. "An opponent" isn't a target: the caster chooses as it
// resolves (the ruling), Ingenious Mastery's shape.

export default defineCard({
  name: "Baleful Mastery",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  alternativeCost: { mana: "{1}{B}" },
  text: "You may pay {1}{B} rather than pay this spell's mana cost.\nIf the {1}{B} cost was paid, an opponent draws a card.\nExile target creature or planeswalker.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "self-alternative-cost-paid" },
        then: { kind: "choose-opponent", then: { kind: "draw", amount: 1, who: "that-player" } },
      },
      { kind: "exile", target: 0 },
    ],
  },
});
