import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 12873.
//
// Rulings:
//   [2013-04-15] While Varolz, the Scar-Striped is on the battlefield, the scavenge cost of a
//     creature card in your graveyard is equal to its mana cost, including any colored mana
//     requirements.
//   [2013-04-15] If the creature card you scavenge has {X} in its mana cost, X is 0.
//   [2013-04-15] Abilities that reduce the cost to cast a creature spell or alternative costs you
//     can pay rather than a card's mana cost don't apply to activating a card's scavenge ability.
//   [2013-04-15] If a creature card has multiple instances of scavenge, you can activate either
//     ability (but not both, as the card will be exiled when you activate one of them). Varolz's
//     ability doesn't affect the scavenge cost of a creature's other scavenge ability.
//   [2013-04-15] Exiling the creature card with scavenge is part of the cost of activating the
//     scavenge ability. Once the ability is activated and the cost is paid, it's too late to stop
//     the ability from being activated by trying to remove the creature card from the graveyard.
//   [2013-04-15] The number of counters that a card's scavenge ability puts on a creature is based
//     on the card's power as it last existed in the graveyard.

export default defineCard({
  name: "Varolz, the Scar-Striped",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Troll", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Each creature card in your graveyard has scavenge. The scavenge cost is equal to its mana cost. (Exile a creature card from your graveyard and pay its mana cost: Put a number of +1/+1 counters equal to that card's power on target creature. Scavenge only as a sorcery.)\nSacrifice another creature: Regenerate Varolz.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Sacrifice another creature: Regenerate Varolz.",
      otherOnly: true,
    },
  ],
  // TODO(scaffold): Each creature card in your graveyard has scavenge. The scavenge cost is equal to its mana cost.
});
