import { defineCard } from "../define.js";

export default defineCard({
  name: "Nivix Barrier",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion", "Wall"],
  power: 0,
  toughness: 4,
  keywords: ["flash", "defender"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\nDefender (This creature can't attack.)\nWhen this creature enters, target attacking creature gets -4/-0 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: -4, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, target attacking creature gets -4/-0 until end of turn.",
    },
  ],
});
