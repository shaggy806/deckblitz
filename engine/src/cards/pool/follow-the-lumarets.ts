import { defineCard } from "../define.js";

// EDHREC rank 16127. Infusion is read as it resolves: with life gained this
// turn, up to two creature and/or land cards instead of up to one (Vivien
// Reid's look — only the cards taken are revealed).
const look = (max: number) =>
  ({
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    reveal: "chosen",
    min: 0,
    max,
    filter: { typesAnyOf: ["creature", "land"] },
    destination: "hand",
    leftover: "bottom-random",
  }) as const;

export default defineCard({
  name: "Follow the Lumarets",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Infusion — Look at the top four cards of your library. You may reveal a creature or land card from among them and put it into your hand. If you gained life this turn, you may instead reveal two creature and/or land cards from among them and put them into your hand. Put the rest on the bottom of your library in a random order.",
  effect: {
    kind: "conditional",
    condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
    then: look(2),
    else: look(1),
  },
});
