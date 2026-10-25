import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 25306.
//
// Rulings:
//   The tokens are of creature type Goblin and Scout. They are affected by things that affect
//     Goblins.
//   The tokens have 'Mountainwalk' in their text, and will be affected by text-changing effects
//     accordingly.

export default defineCard({
  name: "Goblin Scouts",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create three 1/1 red Goblin Scout creature tokens with mountainwalk. (They can't be blocked as long as defending player controls a Mountain.)",
  effect: { kind: "create-token", token: "Goblin Scout Token", count: 3 },
});
