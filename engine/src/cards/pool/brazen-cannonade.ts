import { defineCard } from "../define.js";

// The permission runs from now through the end of combat on your next turn, on
// any turn in between; a card still there then stays exiled (the ruling).
const DIES_TEXT = "Whenever an attacking creature you control dies, this enchantment deals 2 damage to each opponent.";
const RAID_TEXT =
  "Raid — At the beginning of each of your postcombat main phases, if you attacked this turn, exile the top card of your library. Until end of combat on your next turn, you may play that card.";

export default defineCard({
  name: "Brazen Cannonade",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${DIES_TEXT}\n${RAID_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", attacking: true } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "until-end-of-combat-your-next-turn" },
      resolve: null,
      text: RAID_TEXT,
    },
  ],
});
