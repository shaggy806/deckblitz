import { defineCard } from "../define.js";

// EDHREC rank 30229.

export default defineCard({
  name: "Dreamwinder",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 4,
  toughness: 3,
  text: "This creature can't attack unless defending player controls an Island.\n{U}, Sacrifice an Island: Target land becomes an Island until end of turn.",
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: { filter: { subtype: "Island" } } },
      targets: ["land"],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Island"], duration: "end-of-turn" },
      resolve: null,
      text: "{U}, Sacrifice an Island: Target land becomes an Island until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { controls: { subtype: "Island" } },
      text: "This creature can't attack unless defending player controls an Island.",
    },
  ],
});
