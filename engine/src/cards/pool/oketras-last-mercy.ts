import { defineCard } from "../define.js";

export default defineCard({
  name: "Oketra's Last Mercy",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Your life total becomes equal to your starting life total. Lands you control don't untap during your next untap step.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "set-life-total", who: "you", amount: { startingLifeTotal: true } },
      { kind: "skip-next-untap", filter: { type: "land" } },
    ],
  },
});
