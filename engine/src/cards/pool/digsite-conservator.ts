import { defineCard } from "../define.js";

const EXILE_TEXT =
  "Sacrifice this creature: Exile up to four target cards from a single graveyard. Activate only as a sorcery.";
const DIES_TEXT = "When this creature dies, you may pay {4}. If you do, discover 4.";

export default defineCard({
  name: "Digsite Conservator",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 2,
  toughness: 1,
  text: `${EXILE_TEXT}\n${DIES_TEXT} (Exile cards from the top of your library until you exile a nonland card with mana value 4 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "any" },
          max: 4,
          sameController: true,
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "exile", target: 0 },
      },
      resolve: null,
      text: EXILE_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {4} to discover 4?",
        cost: "{4}",
        effect: { kind: "discover", amount: 4 },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
