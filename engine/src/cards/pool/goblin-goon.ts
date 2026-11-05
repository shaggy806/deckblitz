import { defineCard } from "../define.js";

// EDHREC rank 21088.

export default defineCard({
  name: "Goblin Goon",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Mutant"],
  power: 6,
  toughness: 6,
  text: "This creature can't attack unless you control more creatures than defending player.\nThis creature can't block unless you control more creatures than attacking player.",
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { youControlMore: { type: "creature" } },
      text: "This creature can't attack unless you control more creatures than defending player.",
    },
    {
      affects: { scope: "self" },
      cantBlockUnlessAttacker: { youControlMore: { type: "creature" } },
      text: "This creature can't block unless you control more creatures than attacking player.",
    },
  ],
});
