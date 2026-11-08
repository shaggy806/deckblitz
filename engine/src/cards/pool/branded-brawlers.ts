import { defineCard } from "../define.js";

const ATTACK = "This creature can't attack if defending player controls an untapped land.";
const BLOCK = "This creature can't block if you control an untapped land.";

export default defineCard({
  name: "Branded Brawlers",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${ATTACK}\n${BLOCK}`,
  static: [
    { affects: { scope: "self" }, restrictions: [{ kind: "cant-attack", ifDefender: { controls: { type: "land", tapped: false } } }], text: ATTACK },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "land", tapped: false }, atLeast: 1 },
      restrictions: ["cant-block"],
      text: BLOCK,
    },
  ],
});
