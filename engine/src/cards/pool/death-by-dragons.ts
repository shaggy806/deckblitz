import { defineCard } from "../define.js";

// Commander 2011. Rulings:
//   If the player is an illegal target when Death by Dragons tries to resolve, it won't resolve
//     and none of its effects will happen. No player will put a Dragon token onto the battlefield.
//   If Death by Dragons resolves, the player who's targeted is the only one who won't put a
//     Dragon token onto the battlefield.
//
// Each player but the target creates (and so controls) a Dragon of their own: `create-token`
// over `{ otherThan: { target: 0 } }` (the chosen player's slot — not the string `"target"`,
// which is another scope), every player still in the game but that one, in turn order —
// the caster too, unless they targeted themselves. A lone target found illegal fizzles the
// spell (rule 608.2b), so nobody gets one (the first ruling).

export default defineCard({
  name: "Death by Dragons",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player other than target player creates a 5/5 red Dragon creature token with flying.",
  targets: ["player"],
  effect: { kind: "create-token", token: "Dragon Token", count: 1, who: { otherThan: { target: 0 } } },
});
