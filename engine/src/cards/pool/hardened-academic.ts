import { defineCard } from "../define.js";

// EDHREC rank 11166.
//
// Rulings:
//   [2026-03-20] If multiple cards leave your graveyard at the same time, Hardened Academic's last
//     ability will trigger only once.
const LIFELINK_TEXT = "Discard a card: This creature gains lifelink until end of turn.";
const COUNTER_TEXT =
  "Whenever one or more cards leave your graveyard, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Hardened Academic",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 2,
  toughness: 1,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${LIFELINK_TEXT}\n${COUNTER_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: LIFELINK_TEXT,
    },
  ],
  triggered: [
    {
      // Once per move, however many cards left together (the ruling).
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
