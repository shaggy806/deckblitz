import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When Justice enters, return up to one target nonland, nontoken permanent to its owner's hand.";
const GROW_TEXT =
  "Whenever another nonland permanent you control is returned to its owner's hand, put a +1/+1 counter on Justice.";

export default defineCard({
  name: "Justice, Vance Astrovik",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}\n${GROW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // Not "another": Justice may return himself.
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { notTypes: ["land"], token: false } } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      // A permanent always goes to its owner's hand (rule 400.3); matched as
      // it last existed on the battlefield, so "you control" is who
      // controlled it then.
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { notTypes: ["land"] },
        otherOnly: true,
        to: ["hand"],
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
