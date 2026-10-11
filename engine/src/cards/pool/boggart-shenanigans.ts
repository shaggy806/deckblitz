import { defineCard } from "../define.js";

// "Another Goblin you control is put into a graveyard from the battlefield"
// is any Goblin permanent dying (rule 700.4) — a kindred Goblin
// enchantment too.

const TEXT =
  "Whenever another Goblin you control is put into a graveyard from the battlefield, you may have this enchantment deal 1 damage to target player or planeswalker.";

export default defineCard({
  name: "Boggart Shenanigans",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["kindred", "enchantment"],
  subtypes: ["Goblin"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { subtype: "Goblin" }, otherOnly: true },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "may",
        prompt: "Deal 1 damage to target player or planeswalker?",
        effect: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
