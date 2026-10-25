import { defineCard } from "../define.js";

// EDHREC rank 22605.

export default defineCard({
  name: "Rush of Battle",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Creatures you control get +2/+1 until end of turn. Warrior creatures you control gain lifelink until end of turn. (Damage dealt by those Warriors also causes their controller to gain that much life.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 1,
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", subtype: "Warrior", controlledBy: "you" },
        keyword: "lifelink",
        duration: "end-of-turn",
      },
    ],
  },
});
