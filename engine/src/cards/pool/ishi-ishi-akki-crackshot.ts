import { defineCard } from "../define.js";

const TEXT = "Whenever an opponent casts a Spirit or Arcane spell, Ishi-Ishi deals 2 damage to that player.";

export default defineCard({
  name: "Ishi-Ishi, Akki Crackshot",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "opponent",
        filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] },
      },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
