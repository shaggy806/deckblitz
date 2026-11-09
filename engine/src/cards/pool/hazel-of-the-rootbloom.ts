import { defineCard } from "../define.js";

// Top-500 commander. The tokens tapped are chosen with the activation
// (`tapOthers`), X of them; the copy is two if the token is a Squirrel, as the
// ability resolves.

const MANA_TEXT = "{T}, Pay 2 life, Tap X untapped tokens you control: Add X mana in any combination of colors.";
const END_TEXT =
  "At the beginning of your end step, create a token that's a copy of target token you control. If that token is a Squirrel, instead create two tokens that are copies of it.";

export default defineCard({
  name: "Hazel of the Rootbloom",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Squirrel", "Druid"],
  power: 3,
  toughness: 5,
  text: `${MANA_TEXT}\n${END_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 2, tapOthers: { count: "x", filter: { token: true } } },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: "x" },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { token: true } }],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Squirrel" } },
        then: { kind: "create-token-copy", of: 0, count: 2, who: "you" },
        else: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
