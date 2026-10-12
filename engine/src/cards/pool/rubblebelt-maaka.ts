import { defineCard } from "../define.js";

export default defineCard({
  name: "Rubblebelt Maaka",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 3,
  text: "Bloodrush — {R}, Discard this card: Target attacking creature gets +3/+3 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "Bloodrush — {R}, Discard this card: Target attacking creature gets +3/+3 until end of turn.",
      zone: "hand",
    },
  ],
});
