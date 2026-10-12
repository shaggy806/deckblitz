import { defineCard } from "../define.js";

export default defineCard({
  name: "Lotus-Eye Mystics",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 2,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhen this creature enters, return target enchantment card from your graveyard to your hand.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "enchantment" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "When this creature enters, return target enchantment card from your graveyard to your hand.",
    },
  ],
});
