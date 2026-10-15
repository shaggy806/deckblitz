import { defineCard } from "../define.js";

// EDHREC rank 20130.
//
// Rulings:
//   [2026-06-29] You don't have to choose a target for Gollum's second ability. However, if you do
//     and that target becomes illegal by the time the ability tries to resolve, it will not
//     resolve. Each opponent will not lose 2 life.

export default defineCard({
  name: "Gollum the Abandoned",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Horror"],
  power: 2,
  toughness: 2,
  text: "Gollum can't block.\nWhen Gollum enters, exile up to one target card from an opponent's graveyard. Each opponent loses 2 life.\n{2}, Sacrifice an artifact or creature: Return this card from your graveyard to your hand. Activate only as a sorcery.",
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["artifact", "creature"] } },
      },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      zone: "graveyard",
      staysInZone: true,
      text: "{2}, Sacrifice an artifact or creature: Return this card from your graveyard to your hand. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "opponent" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "lose-life", amount: 2, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: "When Gollum enters, exile up to one target card from an opponent's graveyard. Each opponent loses 2 life.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "Gollum can't block.",
    },
  ],
});
