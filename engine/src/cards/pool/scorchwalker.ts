import { defineCard } from "../define.js";

export default defineCard({
  name: "Scorchwalker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 1,
  text: "Bloodrush — {1}{R}{R}, Discard this card: Target attacking creature gets +5/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{R}{R}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 5, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Bloodrush — {1}{R}{R}, Discard this card: Target attacking creature gets +5/+1 until end of turn.",
      zone: "hand",
    },
  ],
});
