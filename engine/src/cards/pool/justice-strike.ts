import { defineCard } from "../define.js";

// EDHREC rank 11574. Guilds of Ravnica. Cut Propulsion's self-damage, without
// the flying clause: the creature is the damage's source.

export default defineCard({
  name: "Justice Strike",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["instant"],
  text: "Target creature deals damage to itself equal to its power.",
  targets: ["creature"],
  effect: { kind: "damage", amount: { powerOf: 0 }, target: 0, from: { target: 0 } },
});
