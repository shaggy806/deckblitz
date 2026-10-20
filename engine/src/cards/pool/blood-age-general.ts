import { defineCard } from "../define.js";

// EDHREC rank 25798. Every attacking Spirit, anyone's, as the ability
// resolves; the bonus stays once one stops attacking (the rulings).
const TEXT = "{T}: Attacking Spirits get +1/+0 until end of turn.";

export default defineCard({
  name: "Blood Age General",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Spirit", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
