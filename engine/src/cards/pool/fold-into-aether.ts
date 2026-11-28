import { defineCard } from "../define.js";

// Fifth Dawn. EDHREC rank 30034.
//
// Rulings:
//   [2004-12-01] If the spell isn't countered (because it's a spell that can't be countered, for
//     example), nothing happens.
//   [2004-12-01] If your Fold into Aether counters a spell you control, you get to put a creature
//     card from your hand onto the battlefield.
//
// `ifCountered` runs only when the counter happened. "Its controller" is the
// countered spell's, read from its last known information (rule 608.2h), and
// that player chooses from their own hand (`as-player`).
export default defineCard({
  name: "Fold into Aether",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Counter target spell. If that spell is countered this way, its controller may put a creature card from their hand onto the battlefield.",
  targets: ["spell"],
  effect: {
    kind: "counter",
    target: 0,
    ifCountered: {
      kind: "as-player",
      who: { controllerOf: 0 },
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature" },
      },
    },
  },
});
