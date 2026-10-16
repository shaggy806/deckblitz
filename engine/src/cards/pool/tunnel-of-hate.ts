import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The right door of Ticket Booth // Tunnel of Hate (ticket-booth-tunnel-of-hate.ts).
const ATTACK = "Whenever you attack, target attacking creature gains double strike until end of turn.";

export default defineCard({
  name: "Tunnel of Hate",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${ATTACK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", attacking: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK,
    },
  ],
  faces: ["Ticket Booth // Tunnel of Hate", "Ticket Booth", "Tunnel of Hate"],
  split: true,
});
