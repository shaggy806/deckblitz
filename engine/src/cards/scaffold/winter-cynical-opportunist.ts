import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 9528.
//
// Rulings:
//   [2024-09-20] Multiple finality counters on a single permanent are redundant.
//   [2024-09-20] Finality counters aren't keyword counters, and a finality counter doesn't give
//     any abilities to the permanent it's on. If that permanent loses its abilities and then would
//     go to a graveyard, it will still be exiled instead.
//   [2024-09-20] If a permanent with a finality counter on it would be put into a graveyard from
//     the battlefield, exile it instead.
//   [2024-09-20] Finality counters don't stop permanents from going to zones other than the
//     graveyard from the battlefield. For example, if a permanent with a finality counter on it
//     would be put into its owner's hand from the battlefield, it does so normally.

export default defineCard({
  name: "Winter, Cynical Opportunist",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 5,
  keywords: ["deathtouch"],
  text: "Deathtouch\nWhenever Winter attacks, mill three cards.\nDelirium — At the beginning of your end step, you may exile any number of cards from your graveyard with four or more card types among them. If you do, put a permanent card from among them onto the battlefield with a finality counter on it.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: "Whenever Winter attacks, mill three cards.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: null,
      resolve: null,
      text: "Delirium — At the beginning of your end step, you may exile any number of cards from your graveyard with four or more card types among them. If you do, put a permanent card from among them onto the battlefield with a finality counter on it.",
      // TODO(scaffold): You may exile any number of cards from your graveyard with four or more card types among them.
      // TODO(scaffold): If you do, put a permanent card from among them onto the battlefield with a finality counter on it.
    },
  ],
});
