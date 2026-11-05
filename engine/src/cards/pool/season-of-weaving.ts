import { defineCard } from "../define.js";

const ONE = "{P} — Draw a card.";
const TWO = "{P}{P} — Choose an artifact or creature you control. Create a token that's a copy of it.";
const THREE = "{P}{P}{P} — Return each nonland, nontoken permanent to its owner's hand.";

export default defineCard({
  name: "Season of Weaving",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `Choose up to five {P} worth of modes. You may choose the same mode more than once.\n${ONE}\n${TWO}\n${THREE}`,
  castModal: {
    minModes: 0,
    maxModes: 5,
    pawprintBudget: 5,
    repeatModes: true,
    modes: [
      { text: ONE, pawprints: 1, effect: { kind: "draw", amount: 1 } },
      {
        text: TWO,
        pawprints: 2,
        effect: {
          kind: "choose-permanents",
          filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" },
          min: 1,
          upTo: 1,
          prompt: "Choose an artifact or creature you control to copy",
          then: { kind: "create-token-copy", of: 0, count: 1 },
        },
      },
      {
        text: THREE,
        pawprints: 3,
        effect: { kind: "return-to-hand-all", filter: { notTypes: ["land"], token: false } },
      },
    ],
  },
});
