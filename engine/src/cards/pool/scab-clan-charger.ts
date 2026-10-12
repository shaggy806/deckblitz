import { defineCard } from "../define.js";

export default defineCard({
  name: "Scab-Clan Charger",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Warrior"],
  power: 2,
  toughness: 4,
  text: "Bloodrush — {1}{G}, Discard this card: Target attacking creature gets +2/+4 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 4, duration: "end-of-turn" },
      resolve: null,
      text: "Bloodrush — {1}{G}, Discard this card: Target attacking creature gets +2/+4 until end of turn.",
      zone: "hand",
    },
  ],
});
