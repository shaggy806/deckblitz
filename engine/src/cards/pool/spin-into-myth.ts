import { defineCard } from "../define.js";
import { fateseal } from "../helpers.js";

// The creature goes first, then the fateseal (rule 701.29a): with its owner
// the opponent fatesealed, the creature is among the two cards looked at.
export default defineCard({
  name: "Spin into Myth",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Put target creature on top of its owner's library, then fateseal 2. (To fateseal 2, look at the top two " +
    "cards of an opponent's library, then put any number of them on the bottom of that player's library and the " +
    "rest on top in any order.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "put-on-library", target: 0, position: "top" }, fateseal(2)],
  },
});
