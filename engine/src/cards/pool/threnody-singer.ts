import { defineCard } from "../define.js";

// EDHREC rank 26325. X is read as the ability resolves (the ruling).

export default defineCard({
  name: "Threnody Singer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren"],
  power: 1,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhen this creature enters, target creature an opponent controls gets -X/-0 until end of turn, where X is your devotion to blue. (Each {U} in the mana costs of permanents you control counts toward your devotion to blue.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: [{ devotionTo: "U" }, -1] },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this creature enters, target creature an opponent controls gets -X/-0 until end of turn, where X is your devotion to blue.",
    },
  ],
});
