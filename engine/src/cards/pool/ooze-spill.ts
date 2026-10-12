import { defineCard } from "../define.js";

// EDHREC rank 13717.
//
// One target: if the spell is gone by resolution, Ooze Spill doesn't
// resolve and makes no Mutagen (its ruling).
export default defineCard({
  name: "Ooze Spill",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. Create a Mutagen token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.\")",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "create-token", token: "Mutagen Token", count: 1 },
    ],
  },
});
