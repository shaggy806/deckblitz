import { defineCard } from "../define.js";

export default defineCard({
  name: "Spellweaver Eternal",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Snake", "Wizard"],
  power: 2,
  toughness: 1,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nAfflict 2 (Whenever this creature becomes blocked, defending player loses 2 life.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "trigger-player" },
      resolve: null,
      text: "Afflict 2",
    },
  ],
});
