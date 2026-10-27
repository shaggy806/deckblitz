import { defineCard } from "../define.js";

// Champions of Kamigawa. Scaled Hulk's trigger at +1/+1.

export default defineCard({
  name: "Kami of the Hunt",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: "Whenever you cast a Spirit or Arcane spell, this creature gets +1/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast a Spirit or Arcane spell, this creature gets +1/+1 until end of turn.",
    },
  ],
});
