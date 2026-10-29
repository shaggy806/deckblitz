import { defineCard } from "../define.js";

// EDHREC rank 8491.
//
// Rulings:
//   [2019-05-03] Once Dovin’s loyalty ability resolves, the damage prevention continues to apply
//     even if Dovin leaves the battlefield.
//   [2019-05-03] In a multiplayer game, if you leave the game after Dovin’s last ability resolves
//     but before your next turn begins, its effect lasts until your next turn would have begun. It
//     neither expires immediately nor lasts indefinitely.
//   [2019-05-03] Dovin’s loyalty ability can target any permanent an opponent controls, not just
//     one that can deal or be dealt damage.

export default defineCard({
  name: "Dovin, Hand of Control",
  manaCost: "{2}{W/U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Dovin"],
  loyalty: 5,
  text: "Artifact, instant, and sorcery spells your opponents cast cost {1} more to cast.\n−1: Until your next turn, prevent all damage that would be dealt to and dealt by target permanent an opponent controls.",
  activated: [
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", whose: "opponent", filter: {} }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-rule", to: { target: 0 }, duration: "until-your-next-turn" },
          { kind: "damage-rule", by: { target: 0 }, duration: "until-your-next-turn" },
        ],
      },
      resolve: null,
      text: "−1: Until your next turn, prevent all damage that would be dealt to and dealt by target permanent an opponent controls.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { typesAnyOf: ["artifact", "instant", "sorcery"] }, caster: "opponent", increaseGeneric: 1 },
      text: "Artifact, instant, and sorcery spells your opponents cast cost {1} more to cast.",
    },
  ],
});
