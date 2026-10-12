import { defineCard } from "../define.js";

export default defineCard({
  name: "Shrouded Shepherd",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Warrior"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, target creature you control gets +2/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, target creature you control gets +2/+2 until end of turn.",
    },
  ],
  faces: ["Shrouded Shepherd", "Cleave Shadows"],
  adventure: true,
});
