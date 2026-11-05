import { defineCard } from "../define.js";

const ENTERS_TEXT = "Omarthis enters with X +1/+1 counters on it.";
const GROW_TEXT =
  "Whenever you put one or more +1/+1 counters on another colorless creature, you may put a +1/+1 counter on Omarthis.";
const DIES_TEXT =
  "When Omarthis dies, manifest a number of cards from the top of your library equal to the number of counters on it.";

export default defineCard({
  name: "Omarthis, Ghostfire Initiate",
  manaCost: "{X}{X}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Snake"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${GROW_TEXT}\n${DIES_TEXT} (To manifest a card, put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "counters-put",
        who: "any",
        counter: "+1/+1",
        byYou: true,
        otherOnly: true,
        filter: { type: "creature", colorless: true },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Omarthis?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: GROW_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "manifest", who: "you", count: { countersOn: "source" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
