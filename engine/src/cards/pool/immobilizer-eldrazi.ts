import { defineCard } from "../define.js";

// Rulings:
//   [2016-01-22] If a creature has already been legally declared as a blocker, Immobilizer
//     Eldrazi's ability won't change or undo that block.
//   [2016-01-22] You compare the power and toughness as you declare blockers, not as Immobilizer
//     Eldrazi's ability resolves.

const TEXT =
  "{2}{C}: Each creature with toughness greater than its power can't block this turn. ({C} represents colorless mana.)";

export default defineCard({
  name: "Immobilizer Eldrazi",
  manaCost: "{1}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 1,
  text: `Devoid (This card has no color.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{C}", tap: false },
      targets: [],
      // A rule for the rest of the turn with a filter, read as blockers are
      // declared (rule 611.2c doesn't lock it — the ruling).
      effect: {
        kind: "restrict",
        filter: { type: "creature", toughness: { op: "gt", n: { own: "power" } } },
        restrictions: ["cant-block"],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
