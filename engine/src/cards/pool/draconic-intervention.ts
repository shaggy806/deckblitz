import { defineCard } from "../define.js";

// EDHREC rank 15469.
export default defineCard({
  name: "Draconic Intervention",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, exile an instant or sorcery card from your graveyard.\nDraconic Intervention deals X damage to each non-Dragon creature, where X is the exiled card's mana value. If a creature dealt damage this way would die this turn, exile it instead.\nExile Draconic Intervention.",
  additionalCost: { exileFromGraveyard: { count: 1, filter: { typesAnyOf: ["instant", "sorcery"] } } },
  exileOnResolve: true,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "damage-all",
        filter: { type: "creature", notSubtypes: ["Dragon"] },
        amount: { manaValueOf: "exiled-as-cost" },
      },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
});
