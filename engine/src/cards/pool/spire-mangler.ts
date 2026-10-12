import { defineCard } from "../define.js";

export default defineCard({
  name: "Spire Mangler",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhen this creature enters, target creature you control with flying gets +2/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, target creature you control with flying gets +2/+0 until end of turn.",
    },
  ],
});
