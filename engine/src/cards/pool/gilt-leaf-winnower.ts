import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 18608.
//
// Rulings:
//   [2015-06-22] The power and toughness of the target non-Elf creature are checked again as the
//     triggered ability would resolve. If they're equal at that time, the ability doesn't resolve.
//
// "Whose power and toughness aren't equal" compares the creature's own two
// values (`{ own: "toughness" }`); a target filter is re-read as the target is
// rechecked on resolution, which is the ruling.
const ETB_TEXT =
  "When this creature enters, you may destroy target non-Elf creature whose power and toughness aren't equal.";

export default defineCard({
  name: "Gilt-Leaf Winnower",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", notSubtypes: ["Elf"], power: { op: "ne", n: { own: "toughness" } } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Destroy target non-Elf creature whose power and toughness aren't equal?",
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
