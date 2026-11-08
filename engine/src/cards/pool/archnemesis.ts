import { defineCard } from "../define.js";

// EDHREC rank 11233.

export default defineCard({
  name: "Archnemesis",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant opponent\nWhenever you attack enchanted player, that player loses 2 life. You draw a card and gain 2 life.\nWhenever a player attacks you, you may attach this Aura to that player.",
  triggered: [
    {
      trigger: { on: "attacks-player", who: "you", defender: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "trigger-player" },
          { kind: "draw", amount: 1 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: "Whenever you attack enchanted player, that player loses 2 life. You draw a card and gain 2 life.",
    },
    {
      trigger: { on: "attacks-player", who: "any", defender: "you" },
      targets: [],
      effect: { kind: "may", prompt: "Attach Archnemesis to that player?", effect: { kind: "attach", target: { player: "trigger-controller" } } },
      resolve: null,
      text: "Whenever a player attacks you, you may attach this Aura to that player.",
    },
  ],
  targets: ["opponent"],
});
