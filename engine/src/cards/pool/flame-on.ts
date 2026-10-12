import { defineCard } from "../define.js";

export default defineCard({
  name: "Flame On!",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  rebound: true,
  text:
    "Put X +1/+1 counters on target creature, where X is the number of noncreature, nonland cards in your graveyard. It gains flying until end of turn.\n" +
    "Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "add-counter",
        target: 0,
        counter: "+1/+1",
        amount: { countInGraveyard: { notTypes: ["creature", "land"], ownedBy: "you" } },
      },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
    ],
  },
});
