import { defineCard } from "../define.js";

// EDHREC rank 24903.
//
// Rulings:
//   [2004-12-01] If the targeted creature has been removed from combat but is still on the
//     battlefield, the damage will be redirected.
//   [2004-12-01] If the targeted creature isn’t on the battlefield when the combat damage would be
//     dealt, the damage isn’t redirected.

export default defineCard({
  name: "Turn the Tables",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "All combat damage that would be dealt to you this turn is dealt to target attacking creature instead.",
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
  effect: { kind: "damage-rule", to: { players: "you" }, combat: true, redirectTo: 0 },
});
