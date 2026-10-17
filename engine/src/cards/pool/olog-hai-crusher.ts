import { defineCard } from "../define.js";

const BLOCK_TEXT = "This creature can't block unless you control a Goblin or Orc.";

// Rulings: it's asked only as blockers are declared, and the Goblin or Orc
// needn't block. `countsSelf`: an Olog-hai made an Orc is one itself.
export default defineCard({
  name: "Olog-hai Crusher",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Troll", "Soldier"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${BLOCK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: {
          kind: "controls",
          filter: { anyOf: [{ subtype: "Goblin" }, { subtype: "Orc" }] },
          atLeast: 1,
          countsSelf: true,
        },
      },
      restrictions: ["cant-block"],
      text: BLOCK_TEXT,
    },
  ],
});
