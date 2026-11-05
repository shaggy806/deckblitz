import { defineCard } from "../define.js";


export default defineCard({
  name: "Crookclaw Transmuter",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 3,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhen this creature enters, switch target creature's power and toughness until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "switch-pt", target: 0, duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, switch target creature's power and toughness until end of turn.",
    },
  ],
});
