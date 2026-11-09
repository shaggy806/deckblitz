import { defineCard } from "../define.js";

// EDHREC rank 3893. "Another one of your opponents": never the one it's on, so
// with one opponent it stays where it is (the ruling).
const TEXT =
  "Whenever enchanted player casts a noncreature spell, roll a d6. This Aura deals damage to that player equal to the result. Then attach this Aura to another one of your opponents chosen at random.";

export default defineCard({
  name: "Maddening Hex",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "attached", filter: { not: { type: "creature" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "roll-dice", sides: 6 },
          { kind: "damage", amount: { roll: "total" }, who: "trigger-player" },
          {
            kind: "choose-opponent",
            random: true,
            exceptEnchanted: true,
            then: { kind: "attach", target: { player: "that-player" } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
