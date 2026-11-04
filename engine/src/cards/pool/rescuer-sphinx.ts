import { defineCard } from "../define.js";

const ENTER_TEXT =
  "As this creature enters, you may return a nonland permanent you control to its owner's hand. If you do, this creature enters with a +1/+1 counter on it.";

export default defineCard({
  name: "Rescuer Sphinx",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: { returnPermanent: { filter: { notTypes: ["land"], controlledBy: "you" } } },
        counters: { kind: "+1/+1", amount: "done-as-enters" },
      },
      text: ENTER_TEXT,
    },
  ],
});
