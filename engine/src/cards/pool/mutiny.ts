import { defineCard } from "../define.js";

// EDHREC rank 15907.

export default defineCard({
  name: "Mutiny",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target creature an opponent controls deals damage equal to its power to another target creature that player controls.",
  targets: [
    "creature-an-opponent-controls",
    { kind: "other", of: "creature", than: { slot: 0 }, sameController: true },
  ],
  // Either target illegal, no damage is dealt (the ruling).
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
});
