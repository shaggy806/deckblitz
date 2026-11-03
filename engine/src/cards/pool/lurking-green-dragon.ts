import { defineCard } from "../define.js";

const ATTACK = "This creature can't attack unless defending player controls a creature with flying.";

export default defineCard({
  name: "Lurking Green Dragon",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ATTACK}`,
  static: [
    { affects: { scope: "self" }, cantAttackUnlessDefender: { controls: { type: "creature", keyword: "flying" } }, text: ATTACK },
  ],
});
