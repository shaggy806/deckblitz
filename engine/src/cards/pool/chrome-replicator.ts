import { defineCard } from "../define.js";

// EDHREC rank 29873.
// Makes Construct → use "Construct Token (Retrofitter Foundry)".
//
// Rulings:
//   [2020-06-23] Chrome Replicator's ability creates just one Construct, no matter how many
//     namesake pairs of permanents you control.
//   [2020-06-23] If you don't control two nonland, nontoken permanents with the same name
//     immediately after Chrome Replicator enters the battlefield, its ability doesn't trigger. If
//     you don't control two as the ability resolves, you don't create a token. They don't have to
//     be the same pair, however.

export default defineCard({
  name: "Chrome Replicator",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, if you control two or more nonland, nontoken permanents with the same name as one another, create a 4/4 colorless Construct artifact creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // This creature counts: a second Chrome Replicator is two with the same name.
      condition: { kind: "controls", filter: { notTypes: ["land"], token: false }, atLeast: 2, sharingAName: true },
      targets: [],
      effect: { kind: "create-token", token: "Construct Token (Retrofitter Foundry)", count: 1 },
      resolve: null,
      text: "When this creature enters, if you control two or more nonland, nontoken permanents with the same name as one another, create a 4/4 colorless Construct artifact creature token.",
    },
  ],
});
