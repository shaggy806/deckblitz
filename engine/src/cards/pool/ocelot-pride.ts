import { defineCard } from "../define.js";

// EDHREC rank 1099. Ascend on a permanent applies any time (rule 702.131b),
// so a Cat token that's your tenth permanent gives the city's blessing
// before the same resolution asks for it (the ruling). The tokens copied are
// fixed as that step resolves (Second Harvest's `{ each }`), the new Cat
// among them, each copied as the effect that made it said (707.2).

const TRIGGER_TEXT =
  "At the beginning of your end step, if you gained life this turn, create a 1/1 white Cat creature token. Then if you have the city's blessing, for each token you control that entered this turn, create a token that's a copy of it.";

export default defineCard({
  name: "Ocelot Pride",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike", "lifelink", "ascend"],
  text: `First strike, lifelink\nAscend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Cat Token (Arahbo, the First Fang)", count: 1 },
          {
            kind: "conditional",
            condition: { kind: "citys-blessing" },
            then: {
              kind: "create-token-copy",
              of: { each: { token: true, controlledBy: "you", enteredThisTurn: true } },
              count: 1,
            },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
