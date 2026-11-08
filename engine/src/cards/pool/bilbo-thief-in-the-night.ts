import { defineCard } from "../define.js";

// EDHREC rank 8616. "From anywhere other than your hand" is
// `costModification.notFromCastersHand`: a graveyard, exile, the library, the
// command zone, and another player's hand alike. The attack trigger casts on
// resolution, paying the spell's costs (not targeted: the card is chosen as
// it resolves), and only an instant or sorcery cast this way is exiled
// instead of going to the graveyard.
export default defineCard({
  name: "Bilbo, Thief in the Night",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Rogue"],
  power: 2,
  toughness: 2,
  text: "Spells you cast from anywhere other than your hand cost {1} less to cast.\nWhenever Bilbo attacks, you may cast an artifact, instant, or sorcery spell from your graveyard. If an instant or sorcery spell cast this way would be put into your graveyard, exile it instead.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, reduceGeneric: 1, when: { caster: "you", notFromCastersHand: true } },
      text: "Spells you cast from anywhere other than your hand cost {1} less to cast.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "cast-now",
        from: "graveyard",
        spell: { typesAnyOf: ["artifact", "instant", "sorcery"] },
        exileAfter: "instants-and-sorceries",
      },
      resolve: null,
      text: "Whenever Bilbo attacks, you may cast an artifact, instant, or sorcery spell from your graveyard. If an instant or sorcery spell cast this way would be put into your graveyard, exile it instead.",
    },
  ],
});
