import { defineCard } from "../define.js";

export default defineCard({
  name: "Zhur-Taa Swine",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 5,
  toughness: 4,
  text: "Bloodrush — {1}{R}{G}, Discard this card: Target attacking creature gets +5/+4 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{R}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 5, toughness: 4, duration: "end-of-turn" },
      resolve: null,
      text: "Bloodrush — {1}{R}{G}, Discard this card: Target attacking creature gets +5/+4 until end of turn.",
      zone: "hand",
    },
  ],
});
