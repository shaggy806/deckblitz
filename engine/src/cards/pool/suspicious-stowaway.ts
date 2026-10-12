import { defineCard } from "../define.js";

export default defineCard({
  name: "Suspicious Stowaway",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Werewolf"],
  power: 1,
  toughness: 1,
  keywords: ["daybound"],
  text: "This creature can't be blocked.\nWhenever this creature deals combat damage to a player, draw a card, then discard a card.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, draw a card, then discard a card.",
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
