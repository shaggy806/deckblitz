import { defineCard } from "../define.js";

// Fifth Dawn. Imprint is an ability word. The two abilities are linked (rule
// 607.2a): the first exiles a card face down (rule 406.3 — only the player who
// looked at it may), the second turns it face up as Clone Shell dies, so its
// characteristics are back (406.3a), and puts it onto the battlefield under
// its controller's control if it's a creature card; any other card stays in
// exile, face up. Read through the link though the Shell has left.
const IMPRINT =
  "Imprint — When this creature enters, look at the top four cards of your library, exile one face down, then put the rest on the bottom of your library in any order.";
const DIES =
  "When this creature dies, turn the exiled card face up. If it's a creature card, put it onto the battlefield under your control.";

export default defineCard({
  name: "Clone Shell",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 2,
  text: `${IMPRINT}\n${DIES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 1,
        max: 1,
        destination: "exile-face-down",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: IMPRINT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "turn-exiled-face-up" },
          { kind: "return-exiled-by-source", linked: "battlefield", under: "you", filter: { type: "creature" } },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
});
