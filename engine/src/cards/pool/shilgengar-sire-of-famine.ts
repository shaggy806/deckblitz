import { defineCard } from "../define.js";

// EDHREC rank 7570.
// Makes Blood → use "Blood Token".
//
// Rulings:
//   [2024-06-07] Finality counters work on any permanent, not only creatures. If a permanent with
//     a finality counter on it would go to a graveyard from the battlefield, exile it instead.
//   [2024-06-07] If you sacrificed an Angel to pay the cost of Shilgengar's second ability, use
//     the toughness of that Angel as it last existed on the battlefield to determine how many
//     Blood tokens to create.
//   [2024-06-07] Finality counters aren't keyword counters, and a finality counter doesn't give
//     any abilities to the permanent it's on. If that permanent loses its abilities and then would
//     go to a graveyard, it will still be exiled instead.
//   [2024-06-07] Multiple finality counters on a single permanent are redundant.
//   [2024-06-07] Finality counters don't stop permanents from going to zones other than the
//     graveyard from the battlefield. For example, if a permanent with a finality counter on it
//     would be put into its owner's hand from the battlefield, it does so normally.
//   [2025-01-24] You can't sacrifice a Blood token to pay multiple costs.
//   [2025-01-24] If an effect refers to a Blood token, it means any artifact token with the
//     subtype Blood, even if it has gained other subtypes.
//   [2025-01-24] Some triggered abilities trigger "whenever you sacrifice a Blood token." These
//     abilities trigger regardless of why you sacrificed that Blood token.

export default defineCard({
  name: "Shilgengar, Sire of Famine",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\nSacrifice another creature: Create a Blood token. If you sacrificed an Angel this way, create a number of Blood tokens equal to its toughness instead.\n{W/B}{W/B}{W/B}, Sacrifice six Blood tokens: Return each creature card from your graveyard to the battlefield with a finality counter on it. Those creatures are Vampires in addition to their other types.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      // The Angel's toughness as it last existed on the battlefield (the
      // ruling — `"sacrificed"` reads it so).
      effect: {
        kind: "conditional",
        condition: { kind: "sacrificed", filter: { subtype: "Angel" } },
        then: { kind: "create-token", token: "Blood Token", count: { toughnessOf: "sacrificed" } },
        else: { kind: "create-token", token: "Blood Token", count: 1 },
      },
      resolve: null,
      text: "Sacrifice another creature: Create a Blood token. If you sacrificed an Angel this way, create a number of Blood tokens equal to its toughness instead.",
      otherOnly: true,
    },
    {
      // "A Blood token" is any artifact token with the subtype Blood (the
      // ruling); each one pays one cost only.
      cost: {
        mana: "{W/B}{W/B}{W/B}",
        tap: false,
        sacrifice: { filter: { subtype: "Blood", token: true }, count: 6 },
      },
      targets: [],
      // All at once, each with a finality counter, Vampires as they enter.
      effect: {
        kind: "return-from-graveyard",
        filter: { type: "creature" },
        destination: "battlefield",
        count: "all",
        withCounters: { kind: "finality", amount: 1 },
        enterAs: { addSubtypes: ["Vampire"] },
      },
      resolve: null,
      text: "{W/B}{W/B}{W/B}, Sacrifice six Blood tokens: Return each creature card from your graveyard to the battlefield with a finality counter on it. Those creatures are Vampires in addition to their other types.",
    },
  ],
});
