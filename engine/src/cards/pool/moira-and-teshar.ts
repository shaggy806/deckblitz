import { defineCard } from "../define.js";

// EDHREC rank 15880.
//
// Whip of Erebos's return (the leave-replacement follows the permanent, the
// end-step exile is a delayed trigger, haste lasts as long as it does) on
// Teshar, Ancestor's Apostle's historic-spell trigger.

const TEXT =
  "Whenever you cast a historic spell, return target nonland permanent card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step. If it would leave the battlefield, exile it instead of putting it anywhere else.";

export default defineCard({
  name: "Moira and Teshar",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Spirit", "Bird"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Artifacts, legendaries, and Sagas are historic.)`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"] },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0, underYourControl: true, exileIfItWouldLeave: true },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "exile", target: 0 },
            text: "Exile the permanent Moira and Teshar returned.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
