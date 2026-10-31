import { defineCard } from "../define.js";

// "Except by three or more creatures" is menace's restriction with three
// (rule 509.1b): blocked by none or by three.
const EVASION = "This creature can't be blocked except by three or more creatures.";

export default defineCard({
  name: "Troll of Khazad-dûm",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 6,
  toughness: 5,
  cycling: { cost: "{1}", search: { subtype: "Swamp" } },
  text: `${EVASION}\nSwampcycling {1} ({1}, Discard this card: Search your library for a Swamp card, reveal it, put it into your hand, then shuffle.)`,
  static: [{ affects: { scope: "self" }, blockedByAtLeast: 3, text: EVASION }],
});
