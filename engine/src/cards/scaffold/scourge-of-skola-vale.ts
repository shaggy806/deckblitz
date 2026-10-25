import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 15478.
//
// Rulings:
//   [2014-02-01] Use the toughness of the sacrificed creature as it last existed on the
//     battlefield to determine how many +1/+1 counters to put on Scourge of Skola Vale.

export default defineCard({
  name: "Scourge of Skola Vale",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: "Trample\nThis creature enters with two +1/+1 counters on it.\n{T}, Sacrifice another creature: Put a number of +1/+1 counters on this creature equal to the sacrificed creature's toughness.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: null,
      resolve: null,
      text: "{T}, Sacrifice another creature: Put a number of +1/+1 counters on this creature equal to the sacrificed creature's toughness.",
      otherOnly: true,
      // TODO(scaffold): Put a number of +1/+1 counters on ~ equal to the sacrificed creature's toughness.
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This creature enters with two +1/+1 counters on it.",
    },
  ],
});
