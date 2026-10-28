import { defineCard } from "../define.js";

// EDHREC rank 5953.
// Makes Treasure → use "Treasure Token".
//
// Rulings:
//   [2021-07-23] The equipped creature's power is checked only during the declare blockers step.
//     If its power becomes greater than 3 after blockers are declared, it still can't be blocked.
//     Similarly, if its power becomes 3 or less after it's been blocked, this won't make it
//     unblocked.
// Stature, Size Shifter's 'can't be blocked if her power is 1 or less', read off the host:\nthe condition is asked as blockers are declared, never after (the ruling).

const ENTER_TEXT = "When this Equipment enters, create a Treasure token.";
const UNBLOCKABLE_TEXT = "Equipped creature can't be blocked as long as its power is 3 or less.";

export default defineCard({
  name: "Thieves' Tools",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT} (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")\n${UNBLOCKABLE_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { power: { op: "lte", n: 3 } } } },
      cantBeBlockedBy: {},
      text: UNBLOCKABLE_TEXT,
    },
  ],
});
