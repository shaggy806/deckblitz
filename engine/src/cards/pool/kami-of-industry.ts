import { defineCard } from "../define.js";

// EDHREC rank 25839.
//
// Balduvian Atrocity's shape: the returned artifact gains haste with no end
// (it's a new object, rule 400.7), and a delayed trigger sacrifices it at the
// beginning of the next end step.
const ENTER_TEXT =
  "When this creature enters, return target artifact card with mana value 3 or less from your graveyard to the battlefield. It gains haste. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Kami of Industry",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 6,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "artifact", manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "sacrifice-target", target: 0 },
            text: "Sacrifice the artifact Kami of Industry returned to the battlefield.",
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
