import { defineCard } from "../define.js";

const ATTACK = "As long as this creature is untapped, creatures can't attack you or planeswalkers you control unless their controller pays {1} for each of those creatures.";
const BLOCK = "As long as this creature is attacking, creatures can't block unless their controller pays {1} for each of those creatures.";

// A tax on attacking its controller while it's home, and on every block by
// anyone while it attacks (rule 509.1d): any creature blocking anything,
// whichever attacker, since nothing in the text ties it to this one.
export default defineCard({
  name: "Archangel of Tithes",
  manaCost: "{1}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ATTACK}\n${BLOCK}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      attackTax: { generic: 1, covers: "you-and-planeswalkers" },
      text: ATTACK,
    },
    {
      affects: { scope: "all-creatures" },
      condition: { kind: "source", filter: { attacking: true } },
      combatTax: { on: ["block"], generic: 1 },
      text: BLOCK,
    },
  ],
});
