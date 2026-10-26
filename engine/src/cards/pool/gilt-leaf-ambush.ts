import { defineCard } from "../define.js";

export default defineCard({
  name: "Gilt-Leaf Ambush",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["kindred", "instant"],
  subtypes: ["Elf"],
  text: "Create two 1/1 green Elf Warrior creature tokens. Clash with an opponent. If you win, those creatures gain deathtouch until end of turn. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value. Any amount of damage a creature with deathtouch deals to a creature is enough to destroy it.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Elf Warrior Token", count: 2 },
      {
        kind: "clash",
        won: {
          kind: "grant-keyword-all",
          filter: { thisWay: "created" },
          keyword: "deathtouch",
          duration: "end-of-turn",
        },
      },
    ],
  },
});
