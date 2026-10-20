import { defineCard } from "../define.js";

// EDHREC rank 16002. Commander Legends (CMR).

const DIES_TEXT =
  "When this creature dies, create three 1/1 green Elf Warrior creature tokens, then mill three cards.";

export default defineCard({
  name: "Eyeblight Cullers",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${DIES_TEXT} (Put the top three cards of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Elf Warrior Token", count: 3 },
          { kind: "mill", target: "you", amount: 3 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
