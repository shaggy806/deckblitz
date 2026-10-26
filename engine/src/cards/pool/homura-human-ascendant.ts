import { defineCard } from "../define.js";

export default defineCard({
  name: "Homura, Human Ascendant",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 4,
  toughness: 4,
  text: "Homura can't block.\nWhen Homura dies, return it to the battlefield flipped.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", flipped: true },
      resolve: null,
      text: "When Homura dies, return it to the battlefield flipped.",
    },
  ],
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "Homura can't block." }],
  faces: ["Homura, Human Ascendant", "Homura's Essence"],
  flip: true,
});
