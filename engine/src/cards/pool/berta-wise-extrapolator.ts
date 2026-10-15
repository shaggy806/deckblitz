import { defineCard } from "../define.js";
import { increment } from "../helpers.js";

// EDHREC rank 9440. Secrets of Strixhaven. The mana trigger isn't a mana
// ability (rule 605.1b — it doesn't trigger off one): it uses the stack and
// adds the mana as it resolves.

const INCREMENT = increment();
const MANA_TEXT = "Whenever one or more +1/+1 counters are put on Berta, add one mana of any color.";
const FRACTAL_TEXT =
  "{X}, {T}: Create a 0/0 green and blue Fractal creature token and put X +1/+1 counters on it.";

export default defineCard({
  name: "Berta, Wise Extrapolator",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Frog", "Druid"],
  power: 1,
  toughness: 4,
  text: `${INCREMENT.text}\n${MANA_TEXT}\n${FRACTAL_TEXT}`,
  triggered: [
    INCREMENT,
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Fractal Token",
        count: 1,
        thenCounters: { kind: "+1/+1", amount: "x" },
      },
      resolve: null,
      text: FRACTAL_TEXT,
    },
  ],
});
