import { defineCard } from "../define.js";

// "Can't be blocked by Walls this turn" is a rule on the creature (rule
// 509.1b), not an ability it gains.
export default defineCard({
  name: "Kick in the Door",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature. That creature gains haste until end of turn and can't be blocked by Walls this turn. Venture into the dungeon. (Enter the first room or advance to the next room.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: [], cantBeBlockedBy: { subtype: "Wall" } },
      { kind: "venture" },
    ],
  },
});
