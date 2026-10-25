import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 31288.
//
// Rulings:
//   [2013-09-15] Heroic abilities will trigger only once per spell, even if that spell targets the
//     creature with the heroic ability multiple times.
//   [2013-09-15] Heroic abilities will resolve before the spell that caused them to trigger.
//   [2013-09-15] Heroic abilities won’t trigger when a copy of a spell is created on the stack or
//     when a spell’s targets are changed to include a creature with a heroic ability.
//   [2014-02-01] If Mindreaver leaves the battlefield, and later another Mindreaver enters the
//     battlefield, it is a new object (even if the two were represented by the same card). The
//     last ability of the second Mindreaver doesn’t refer to any cards exiled with the first one.
//   [2014-02-01] The cards are exiled face up. All players can look at them.

export default defineCard({
  name: "Mindreaver",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: "Heroic — Whenever you cast a spell that targets this creature, exile the top three cards of target player's library.\n{U}{U}, Sacrifice this creature: Counter target spell with the same name as a card exiled with this creature.",
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false, sacrifice: "self" },
      targets: [],
      effect: null,
      resolve: null,
      text: "{U}{U}, Sacrifice this creature: Counter target spell with the same name as a card exiled with this creature.",
      // TODO(scaffold): Counter target spell with the same name as a card exiled with ~.
    },
  ],
  // TODO(scaffold): Heroic — Whenever you cast a spell that targets this creature, exile the top three cards of target player's library.
});
