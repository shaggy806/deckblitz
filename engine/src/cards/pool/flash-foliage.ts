import { defineCard } from "../define.js";

export default defineCard({
  name: "Flash Foliage",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Cast this spell only during combat after blockers are declared.\nCreate a 1/1 green Saproling creature token that's blocking target creature attacking you.\nDraw a card.",
  targets: ["creature-attacking-you"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Saproling Token", count: 1, separate: true },
      { kind: "enter-blocking", blocker: "created", attacker: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
  castOnlyIf: { kind: "turn-structure", steps: ["declare-blockers", "combat-damage", "end-combat"] },
});
