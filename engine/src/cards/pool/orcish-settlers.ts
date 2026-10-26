import { defineCard } from "../define.js";

// EDHREC rank 18325. Floodwater Dam's "X target lands" with {X}{X} in the cost;
// the lands are destroyed as one event.

const TEXT = "{X}{X}{R}, {T}, Sacrifice this creature: Destroy X target lands.";

export default defineCard({
  name: "Orcish Settlers",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{X}{R}", tap: true, sacrifice: "self" },
      targets: [{ kind: "any-number", of: "land", min: "x", max: "x" }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
