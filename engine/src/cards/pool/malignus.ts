import { defineCard } from "../define.js";

// A CDA (rule 604.3): the player aggregate over its controller's opponents
// still in the game (their owner's, off the battlefield), halved and rounded
// up (rule 107.1a). With no opponent left, 0.
const PT_TEXT =
  "Malignus's power and toughness are each equal to half the highest life total among your opponents, rounded up.";
const DAMAGE_TEXT = "Damage that would be dealt by this creature can't be prevented.";

export default defineCard({
  name: "Malignus",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Spirit"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { amongPlayers: "greatest", of: { lifeTotal: "each" }, who: "each-opponent", half: "up" },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
    { affects: { scope: "self" }, damageCantBePrevented: { fromSelf: true }, text: DAMAGE_TEXT },
  ],
});
