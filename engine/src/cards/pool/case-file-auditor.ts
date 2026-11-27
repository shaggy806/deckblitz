import { defineCard } from "../define.js";

// Murders at Karlov Manor. "Whenever you solve a Case" is a Case you control
// becoming solved (rule 719.3a — the `solves-case` trigger event); one
// ability with two trigger events, written as two triggers of the same text
// (Up the Beanstalk's shape).

const TEXT =
  "When this creature enters and whenever you solve a Case, look at the top six cards of your library. You may reveal an enchantment card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

const LOOK = {
  kind: "look-and-choose",
  zone: "library",
  count: 6,
  reveal: "chosen",
  min: 0,
  max: 1,
  filter: { type: "enchantment" },
  destination: "hand",
  leftover: "bottom-random",
} as const;

export default defineCard({
  name: "Case File Auditor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 1,
  toughness: 4,
  text: `${TEXT}\nYou may spend mana as though it were mana of any color to cast Case spells.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: LOOK,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "event", event: "solves-case", who: "you-control" },
      targets: [],
      effect: LOOK,
      resolve: null,
      text: TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      spendManaAs: { as: "any-color", spell: { subtype: "Case" } },
      text: "You may spend mana as though it were mana of any color to cast Case spells.",
    },
  ],
});
