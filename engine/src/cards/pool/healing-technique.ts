import { defineCard } from "../define.js";
import { demonstrate } from "../helpers.js";

// Each copy's "your graveyard" is its controller's (the opponent's copy
// returns a card of their own). "Exile Healing Technique" is the card itself
// (`exileOnResolve`); a copy ceases to exist anyway.
const TEXT =
  "Return target card from your graveyard to your hand. You gain life equal to that card's mana value. Exile Healing Technique.";

export default defineCard({
  name: "Healing Technique",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Demonstrate (When you cast this spell, you may copy it. If you do, choose an opponent to also copy it. Players may choose new targets for their copies.)\n${TEXT}`,
  targets: [{ kind: "card-in-graveyard", whose: "you" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "gain-life", amount: { manaValueOf: 0 } },
    ],
  },
  exileOnResolve: true,
  triggered: [demonstrate()],
});
