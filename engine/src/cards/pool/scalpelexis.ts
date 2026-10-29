import { defineCard } from "../define.js";

// EDHREC rank 28233.
//
// Each pass exiles four cards, and repeats while two or more of that pass's
// four share a name (the ruling: "as often as it takes to not get a matching
// pair").

const TRIGGER =
  "Whenever this creature deals combat damage to a player, that player exiles the top four cards of their library. If two or more of those cards have the same name, repeat this process.";

export default defineCard({
  name: "Scalpelexis",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 1,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "repeat",
        effect: { kind: "exile-from-library", whose: "trigger-player", amount: 4 },
        again: { kind: "this-way", what: "exiled", sharing: "name", atLeast: 2 },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
