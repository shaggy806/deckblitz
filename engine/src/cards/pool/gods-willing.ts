import { defineCard } from "../define.js";

// EDHREC rank 3395.
//
// The colour is chosen as the spell resolves (`grant-protection`'s `choose`),
// before the scry.
export default defineCard({
  name: "Gods Willing",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature you control gains protection from the color of your choice until end of turn. (It can't be blocked, targeted, dealt damage, enchanted, or equipped by anything of that color.)\nScry 1.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-protection", target: 0, from: { choose: "color" }, duration: "end-of-turn" },
      { kind: "scry", amount: 1 },
    ],
  },
});
