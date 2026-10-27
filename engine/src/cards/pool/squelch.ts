import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 22472. A mana ability never uses
// the stack, so it can't be targeted (the ruling).

export default defineCard({
  name: "Squelch",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target activated ability. (Mana abilities can't be targeted.)\nDraw a card.",
  targets: [{ kind: "ability", abilityKind: "activated" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
