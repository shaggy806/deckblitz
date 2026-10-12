import { defineCard } from "../define.js";

export default defineCard({
  name: "Knight of Sursi",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "flanking"],
  suspend: { n: 3, cost: "{W}" },
  text: "Flying; flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\nSuspend 3—{W} (Rather than cast this card from your hand, you may pay {W} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Flanking",
    },
  ],
});
