import { defineCard } from "../define.js";

// EDHREC rank 8478. A daybound werewolf; the back face is Lord of the
// Ulvenwald. "Add {R} or {G}" is a choice made as the trigger resolves (rule
// 608.2d), and "until end of turn, you don't lose this mana" is `persists`
// (still emptied at cleanup, when "until end of turn" ends — rule 514.2).
const ATTACK_TEXT =
  "Whenever this creature attacks, add {R} or {G}. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Kessig Naturalist",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
  toughness: 2,
  keywords: ["daybound"],
  text: `${ATTACK_TEXT}\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 1, persists: true },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Kessig Naturalist", "Lord of the Ulvenwald"],
  transform: true,
});
