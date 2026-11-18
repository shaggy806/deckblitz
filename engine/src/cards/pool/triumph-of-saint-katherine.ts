import { defineCard } from "../define.js";

// EDHREC rank 13884. Warhammer 40,000 Commander.
//
// Praesidium Protectiva is `cloak-exiled-pile` with `source`, `onto:
// "library-top"` and `whole`: "it" is the card in the graveyard it went to
// (rule 400.7), exiled with the top six cards in one face-down pile (rule
// 406.3), and "if you do" is the ruling's all or nothing — with fewer than
// six cards in the library, or the card gone from the graveyard, nothing is
// exiled. "Your graveyard" fires only for a card its controller owns
// (`ownedBy: "you"`, read as it last existed): a card goes to its owner's.
//
// Rulings:
//   [2022-10-07] If you have fewer than six cards in your library or if
//     Triumph of Saint Katherine isn't in your graveyard as the triggered
//     ability resolves, no cards will be exiled and the ability will do nothing.

const PROTECTIVA_TEXT =
  "Praesidium Protectiva — When this creature is put into your graveyard from the battlefield, exile it and the top six cards of your library in a face-down pile. If you do, shuffle that pile and put it back on top of your library.";

export default defineCard({
  name: "Triumph of Saint Katherine",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["lifelink"],
  text: `Lifelink\n${PROTECTIVA_TEXT}\nMiracle {1}{W} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)`,
  miracle: { cost: "{1}{W}" },
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"], filter: { ownedBy: "you" } },
      targets: [],
      effect: { kind: "cloak-exiled-pile", source: true, libraryTop: 6, onto: "library-top", whole: true },
      resolve: null,
      text: PROTECTIVA_TEXT,
    },
  ],
});
