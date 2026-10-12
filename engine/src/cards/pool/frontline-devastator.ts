import { defineCard } from "../define.js";

export default defineCard({
  name: "Frontline Devastator",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Zombie", "Minotaur", "Warrior"],
  power: 3,
  toughness: 3,
  text: "Afflict 2 (Whenever this creature becomes blocked, defending player loses 2 life.)\n{1}{R}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "trigger-player" },
      resolve: null,
      text: "Afflict 2",
    },
  ],
});
