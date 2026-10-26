import { defineCard } from "../define.js";

export default defineCard({
  name: "Woodland Guidance",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return target card from your graveyard to your hand. Clash with an opponent. If you win, untap all Forests you control. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)\nExile Woodland Guidance.",
  targets: [{ kind: "card-in-graveyard", whose: "you" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "clash", won: { kind: "untap-all", filter: { subtype: "Forest", controlledBy: "you" } } },
    ],
  },
  exileOnResolve: true,
});
