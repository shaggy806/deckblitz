import { defineCard } from "../define.js";

export default defineCard({
  name: "Seafaring Werewolf",
  art: "https://cards.scryfall.io/art_crop/back/a/b/ab17c8fa-4c06-4542-848a-e3f2f9f47c27.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 2,
  toughness: 1,
  keywords: ["nightbound"],
  text: "This creature can't be blocked.\nWhenever this creature deals combat damage to a player, draw a card.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
  faces: ["Suspicious Stowaway", "Seafaring Werewolf"],
  transform: true,
});
