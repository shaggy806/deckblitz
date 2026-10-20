import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 11938. Not a mana ability: it targets, and uses
// the stack (the ruling).
const TEXT = "{T}: Untap target snow land.";

export default defineCard({
  name: "Sculptor of Winter",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Elf", "Rogue"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "land", supertype: "snow" } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
