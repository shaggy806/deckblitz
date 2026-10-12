import { defineCard } from "../define.js";

export default defineCard({
  name: "Meticulous Artisan",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Djinn", "Artificer"],
  power: 3,
  toughness: 3,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhen this creature enters, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
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
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Treasure token.",
    },
  ],
});
