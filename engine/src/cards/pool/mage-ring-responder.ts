import { defineCard } from "../define.js";

// EDHREC rank 22918.

export default defineCard({
  name: "Mage-Ring Responder",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 7,
  toughness: 7,
  text: "This creature doesn't untap during your untap step.\n{7}: Untap this creature.\nWhenever this creature attacks, it deals 7 damage to target creature defending player controls.",
  static: [
    {
      affects: { scope: "self" },
      doesntUntap: true,
      text: "This creature doesn't untap during your untap step.",
    },
  ],
  activated: [
    {
      cost: { mana: "{7}", tap: false },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "{7}: Untap this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: { kind: "damage", amount: 7, target: 0 },
      resolve: null,
      text: "Whenever this creature attacks, it deals 7 damage to target creature defending player controls.",
    },
  ],
});
