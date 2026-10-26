import { defineCard } from "../define.js";

// EDHREC rank 8699.

/** Its sacrifice ability works only while it's suspended (rule 702.62b —
 * `zone: "suspended"`): a time counter off per permanent, so it can come in
 * long before its tenth upkeep. */
export default defineCard({
  name: "Greater Gargadon",
  manaCost: "{9}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 9,
  toughness: 7,
  suspend: { n: 10, cost: "{R}" },
  text: "Suspend 10—{R}\nSacrifice an artifact, creature, or land: Remove a time counter from this card. Activate only if this card is suspended.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { typesAnyOf: ["artifact", "creature", "land"] } } },
      zone: "suspended",
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: "Sacrifice an artifact, creature, or land: Remove a time counter from this card. Activate only if this card is suspended.",
    },
  ],
});
