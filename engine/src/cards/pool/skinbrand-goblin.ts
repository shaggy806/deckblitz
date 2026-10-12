import { defineCard } from "../define.js";

export default defineCard({
  name: "Skinbrand Goblin",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 1,
  text: "Bloodrush — {R}, Discard this card: Target attacking creature gets +2/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Bloodrush — {R}, Discard this card: Target attacking creature gets +2/+1 until end of turn.",
      zone: "hand",
    },
  ],
});
