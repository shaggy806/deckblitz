import { defineCard } from "../define.js";

// EDHREC rank 10970. "Target player other than its controller" is an `other`
// slot against the token's controller (B308); "Do this only once each turn" is
// the `may`'s `oncePerTurn`; "if an opponent created a token this way" asks
// the resolution's created tokens of the effect controller's opponents.
const GOLDEN_RULE =
  "Golden Rule — Whenever a token enters, you may have target player other than its controller create a token that's a copy of it, then you draw a card if an opponent created a token this way. Do this only once each turn.";

export default defineCard({
  name: "Lucy MacLean, Positively Armed",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 3,
  toughness: 5,
  text: GOLDEN_RULE,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { token: true } },
      targets: [{ kind: "other", of: "player", than: "trigger-object-controller" }],
      effect: {
        kind: "may",
        prompt: "Have that player create a token that's a copy of it?",
        oncePerTurn: true,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token-copy", of: "trigger-object", count: 1, who: { target: 0 } },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "created", who: "each-opponent" },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: GOLDEN_RULE,
    },
  ],
});
