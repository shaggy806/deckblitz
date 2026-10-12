import { defineCard } from "../define.js";

// EDHREC rank 8204.
//
// "While this creature has a -1/-1 counter on it" is part of the trigger
// condition (rule 603.1), not an intervening "if": a `whileCondition`, asked
// as the cards arrive and not again as the ability resolves. "One or more
// permanent cards … from anywhere" is The Gitrog Monster's batched trigger
// over the permanent card types; tokens aren't cards and never count.

const ENTER_TEXT = "This creature enters with six -1/-1 counters on it.";
const TRIGGER_TEXT =
  "Whenever one or more permanent cards are put into your graveyard from anywhere while this creature has a -1/-1 counter on it, remove a -1/-1 counter from this creature.";

export default defineCard({
  name: "Moonshadow",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 7,
  keywords: ["menace"],
  text: `Menace\n${ENTER_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 6 } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "put-into-graveyard",
        who: "you",
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
        batched: true,
      },
      whileCondition: { kind: "self-counters", counter: "-1/-1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
