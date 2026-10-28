import { defineCard } from "../define.js";

// EDHREC rank 16376.
//
// Swarmborn Giant's monstrous condition, with reach and Watcher in the Web's
// `blockAdditional` count beside it.
//
// Rulings:
//   [2013-09-15] Once a creature becomes monstrous, it can't become monstrous again. If the
//     creature is already monstrous when the monstrosity ability resolves, nothing happens.
//   [2013-09-15] Monstrous isn't an ability that a creature has. It's just something true about
//     that creature. If the creature stops being a creature or loses its abilities, it will
//     continue to be monstrous.

const STATIC_TEXT =
  "As long as this creature is monstrous, it has reach and can block an additional ninety-nine creatures each combat.";

export default defineCard({
  name: "Hundred-Handed One",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 3,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n{3}{W}{W}{W}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)\n${STATIC_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{W}{W}{W}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: "{3}{W}{W}{W}: Monstrosity 3.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { monstrous: true } },
      grantKeywords: ["reach"],
      blockAdditional: 99,
      text: STATIC_TEXT,
    },
  ],
});
