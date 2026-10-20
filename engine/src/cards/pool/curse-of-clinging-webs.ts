import { defineCard } from "../define.js";

const TEXT =
  "Whenever a nontoken creature enchanted player controls dies, exile it and you create a 1/2 green Spider creature token with reach.";

export default defineCard({
  name: "Curse of Clinging Webs",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "dies", who: "enchanted-player-controls", filter: { type: "creature", token: false } },
      targets: [],
      // The Curse's controller gets the Spider, whoever is enchanted; and gets
      // it even if the card has left the graveyard by now (the rulings).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          { kind: "create-token", token: "1/2 Green Spider Token (Reach)", count: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
