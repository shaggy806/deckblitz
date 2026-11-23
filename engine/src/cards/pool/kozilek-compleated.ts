import { defineCard } from "../define.js";
import { annihilator } from "../helpers.js";

// Playtest card. {C/P} is a hybrid pip of {C} or 2 life. The discard count is read per opponent as
// the cast trigger resolves (the ruling); one with two or fewer cards discards nothing.
// Annihinfect is annihilator with its N the defending player's poison counters, read as it resolves.

const CAST =
  "When you cast this spell, each opponent gets two poison counters, then each opponent with more than two cards in hand discards cards equal to the difference.";
const ANNIHINFECT =
  "Annihinfect (Whenever this creature attacks, defending player sacrifices a permanent for each poison counter they have.)";

export default defineCard({
  name: "Kozilek, Compleated",
  manaCost: "{8}{C/P}{C/P}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Eldrazi"],
  power: 12,
  toughness: 12,
  text: `({C/P} can be paid with either {C} or 2 life.)\n${CAST}\n${ANNIHINFECT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-player-counters", counter: "poison", amount: 2, who: "each-opponent" },
          {
            kind: "discard",
            target: "each-opponent",
            amount: { difference: [{ cardsInHand: "each" }, 2] },
          },
        ],
      },
      resolve: null,
      text: CAST,
    },
    annihilator({ playerCounters: "poison", who: "trigger-player" }, ANNIHINFECT),
  ],
});
