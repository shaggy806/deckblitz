import { defineCard } from "../define.js";

// A daybound werewolf; the back face is Baneclaw Marauder.

export default defineCard({
  name: "Baneblade Scoundrel",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Werewolf"],
  power: 4,
  toughness: 3,
  keywords: ["daybound"],
  text: "Whenever this creature becomes blocked, each creature blocking it gets -1/-1 until end of turn.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", blockingRelation: { relation: "blocking" } },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever this creature becomes blocked, each creature blocking it gets -1/-1 until end of turn.",
    },
  ],
  faces: ["Baneblade Scoundrel", "Baneclaw Marauder"],
  transform: true,
});
