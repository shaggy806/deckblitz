import { defineCard } from "../define.js";

// Bloomburrow (BLB). EDHREC rank 12663. Crimson Operative's impulse draw: played under
// the normal costs and timing (the ruling).
const TEXT =
  "When this creature enters, exile the top card of your library. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Alania's Pathmaker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Otter", "Wizard"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
