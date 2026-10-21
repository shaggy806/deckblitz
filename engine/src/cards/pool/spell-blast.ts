import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 20120.
//
// X is announced before targets are chosen (rule 601.2b-c), so the target
// filter reads it (Rydia, Summoner of Mist's `n: "x"`). A spell's mana value
// on the stack counts its own chosen X (the ruling; rule 202.3e).
export default defineCard({
  name: "Spell Blast",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell with mana value X. (For example, if that spell's mana cost is {3}{U}{U}, X is 5.)",
  targets: [{ kind: "spell", filter: { manaValue: { op: "eq", n: "x" } } }],
  effect: { kind: "counter", target: 0 },
});
