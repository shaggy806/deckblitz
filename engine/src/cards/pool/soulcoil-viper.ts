import { defineCard } from "../define.js";

// EDHREC rank 17138.
//
// Rulings:
//   [2023-11-10] Because you choose the target of Soulcoil Viper's ability before you pay the cost
//     of sacrificing it, Soulcoil Viper can't be the target of its own ability.
//   [2023-11-10] Finality counters work on any permanent, not only creatures. If a permanent with
//     a finality counter on it would be put into a graveyard from the battlefield, exile it
//     instead.
//   [2023-11-10] Multiple finality counters on a single permanent are redundant.
//   [2023-11-10] Finality counters don't stop permanents from going to zones other than the
//     graveyard from the battlefield. For example, if a permanent with a finality counter on it
//     would be put into its owner's hand from the battlefield, it does so normally.
//   [2023-11-10] Finality counters aren't keyword counters, and a finality counter doesn't give
//     any abilities to the permanent it's on. If that permanent loses its abilities and then would
//     go to a graveyard, it will still be exiled instead.

export default defineCard({
  name: "Soulcoil Viper",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 3,
  text: "{B}, {T}, Sacrifice this creature: Return target creature card from your graveyard to the battlefield with a finality counter on it. Activate only as a sorcery. (If a creature with a finality counter on it would die, exile it instead.)",
  activated: [
    {
      cost: { mana: "{B}", tap: true, sacrifice: "self" },
      // The target is chosen while this creature is still on the battlefield,
      // so it can't be its own target (the ruling).
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "finality", amount: 1 } },
      resolve: null,
      text: "{B}, {T}, Sacrifice this creature: Return target creature card from your graveyard to the battlefield with a finality counter on it. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
