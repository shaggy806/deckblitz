import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

// Imprint isn't targeted: the artifact is chosen as the ability resolves, and
// goes back when Idris leaves (rule 610.3). What Idris has is read from the card
// in exile (rule 607.2a); an ability naming it means Idris (rule 201.5b). An
// artifact token ceases to exist in exile (rule 111.7), leaving nothing to read.
const IMPRINT_TEXT = "Imprint — When Idris enters, exile another artifact you control until Idris leaves the battlefield.";
const GRANT_TEXT =
  "Idris has all activated and triggered abilities of the exiled card and gets +X/+X, where X is the exiled card's mana value.";

const VANISHING = vanishing(3);

export default defineCard({
  name: "Idris, Soul of the TARDIS",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Incarnation"],
  power: 3,
  toughness: 3,
  text: `Vanishing 3\n${IMPRINT_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    ...VANISHING.triggered,
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "artifact", controlledBy: "you" },
        min: 1,
        upTo: 1,
        exceptSource: true,
        then: { kind: "exile", target: 0, untilSourceLeaves: true },
        prompt: "Exile another artifact you control until Idris leaves the battlefield",
      },
      resolve: null,
      text: IMPRINT_TEXT,
    },
  ],
  static: [
    ...VANISHING.static,
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "exiled-with", filter: {}, withTriggered: true },
      grantPtPerCount: { aggregate: { aggregate: "sum", of: "mana-value", filter: {}, in: "exiled-with-source" }, pt: [1, 1] },
      text: GRANT_TEXT,
    },
  ],
});
