import { defineCard } from "../define.js";

export default defineCard({
  name: "Leering Emblem",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Whenever you cast a spell, equipped creature gets +2/+2 until end of turn.\nEquip {2}",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "attached",
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever you cast a spell, equipped creature gets +2/+2 until end of turn.",
    },
  ],
});
