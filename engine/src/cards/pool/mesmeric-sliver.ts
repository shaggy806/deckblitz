import { defineCard } from "../define.js";
import { fateseal } from "../helpers.js";

// Every Sliver, whoever controls it: the granted trigger is that Sliver's
// own, so its controller fateseals (rule 701.29a), choosing the opponent as
// it resolves.
const GRANTED_TEXT = "When this permanent enters, you may fateseal 1.";

export default defineCard({
  name: "Mesmeric Sliver",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text:
    `All Slivers have "${GRANTED_TEXT}" (To fateseal 1, its controller looks at the top card of an opponent's ` +
    "library, then they may put that card on the bottom of that library.)",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [],
          effect: { kind: "may", prompt: "Fateseal 1?", effect: fateseal(1) },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `All Slivers have "${GRANTED_TEXT}"`,
    },
  ],
});
