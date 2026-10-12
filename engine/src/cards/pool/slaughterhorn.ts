import { defineCard } from "../define.js";

export default defineCard({
  name: "Slaughterhorn",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 2,
  text: "Bloodrush — {G}, Discard this card: Target attacking creature gets +3/+2 until end of turn.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 3, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Bloodrush — {G}, Discard this card: Target attacking creature gets +3/+2 until end of turn.",
      zone: "hand",
    },
  ],
});
