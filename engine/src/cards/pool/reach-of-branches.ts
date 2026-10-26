import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] The triggered ability will trigger whenever any land with the subtype Forest
//     enters under your control, not just one named Forest.
//   [2008-04-01] If Reach of Branches leaves your graveyard before its triggered ability resolves,
//     the ability will have no effect, even if the card returns to your graveyard before then.
//   [2024-06-07] While it appears only on cards that already have other card types, kindred is a
//     card type and will be counted by effects that refer to the number of card types among cards
//     in a zone.
//   [2024-06-07] Kindred is a card type that allows noncreature cards to have creature types. For
//     example, Echoes of Eternity is an Eldrazi (although not a creature) while on the battlefield
//     and an Eldrazi card (although not a creature card) in zones other than the battlefield.
//   [2024-06-07] This cards was originally printed with the "tribal" card type. That card type has
//     been replaced with "kindred". This change does not affect the gameplay function of this
//     card.

export default defineCard({
  name: "Reach of Branches",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["kindred", "instant"],
  subtypes: ["Treefolk"],
  text: "Create a 2/5 green Treefolk Shaman creature token.\nWhenever a Forest you control enters, you may return this card from your graveyard to your hand.",
  effect: { kind: "create-token", token: "Treefolk Shaman Token", count: 1 },
  triggered: [
    {
      // From the graveyard (Veilborn Ghoul's shape): any land with the
      // Forest subtype; a card that left the graveyard first isn't returned.
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Forest" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Reach of Branches from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: "Whenever a Forest you control enters, you may return this card from your graveyard to your hand.",
    },
  ],
});
