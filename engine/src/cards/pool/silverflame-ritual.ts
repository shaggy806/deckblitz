import { defineCard } from "../define.js";

// Adamant: the white mana actually spent to cast it (`manaSpentOfColors`),
// read as it resolves.
const ADAMANT =
  "Adamant — If at least three white mana was spent to cast this spell, creatures you control gain vigilance until end of turn.";

export default defineCard({
  name: "Silverflame Ritual",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `Put a +1/+1 counter on each creature you control.\n${ADAMANT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { W: 3 } } },
        then: {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          keyword: "vigilance",
          duration: "end-of-turn",
        },
      },
    ],
  },
});
