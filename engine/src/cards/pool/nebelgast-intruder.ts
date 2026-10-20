import { defineCard } from "../define.js";

// EDHREC rank 29503.

export default defineCard({
  name: "Nebelgast Intruder",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhen this creature enters, up to one target creature an opponent controls gets -2/-0 until end of turn.",
  triggered: [
    {
      resolve: null,
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "end-of-turn" },
      text: "When this creature enters, up to one target creature an opponent controls gets -2/-0 until end of turn.",
    },
  ],
});
