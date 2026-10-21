import { defineCard } from "../define.js";

// Hatut Zeraze Strike Force's cast trigger. The card found is the reveal's
// target 0; declined, it goes to the bottom with the rest (`rest` takes the
// found card too when nothing moved it — the first ruling).
const COPY_TEXT =
  "When you cast this spell, copy it for each time you've cast your commander from the command zone this game.";
const REVEAL_TEXT =
  "Reveal cards from the top of your library until you reveal a nonland permanent card. You may put that card onto the battlefield. Then put all cards revealed this way that weren't put onto the battlefield on the bottom of your library in a random order.";

export default defineCard({
  name: "Genesis Storm",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${COPY_TEXT}\n${REVEAL_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", count: { commanderCasts: "you" } },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  targets: [],
  effect: {
    kind: "reveal-until",
    filter: {
      typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"],
      notTypes: ["land"],
    },
    then: {
      kind: "may",
      prompt: "Put that card onto the battlefield?",
      effect: { kind: "put-onto-battlefield", target: 0 },
    },
    rest: "bottom-random",
  },
});
