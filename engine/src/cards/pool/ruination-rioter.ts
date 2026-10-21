import { defineCard } from "../define.js";

const TEXT =
  "When this creature dies, you may have it deal damage to any target equal to the number of land cards in your graveyard.";

export default defineCard({
  name: "Ruination Rioter",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Have Ruination Rioter deal damage equal to the land cards in your graveyard?",
        effect: {
          kind: "damage",
          amount: { countInGraveyard: { type: "land", ownedBy: "you" } },
          target: 0,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
