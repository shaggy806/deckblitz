import { defineCard } from "../define.js";

// EDHREC rank 9983.

const TEXT =
  "{R}, {T}: Flip a coin. If you win the flip, destroy target artifact and untap this creature. If you lose the flip, sacrifice this creature.";

export default defineCard({
  name: "Goblin Archaeologist",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: ["artifact"],
      effect: {
        kind: "flip-coin",
        won: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "untap", target: "source" },
          ],
        },
        lost: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
