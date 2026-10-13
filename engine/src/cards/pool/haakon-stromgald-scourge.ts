import { defineCard } from "../define.js";

// EDHREC rank 7046.
// "You may cast this card from your graveyard, but not from anywhere else" is
// two pieces: an always-on `castFromGraveyardIf` (Gravecrawler's permission,
// with no condition) and a `castOnlyIf` that the card be in a graveyard as
// it's cast — which stops a cast from the hand, the command zone or exile
// (Spelljack, cascade) alike, as the second ruling says. The Knight permission
// is a battlefield static, so it works only while Haakon is there (Karador's
// shape), and costs are paid as usual (the first ruling).
const ALWAYS = { kind: "controls", filter: {}, atLeast: 0 } as const;

export default defineCard({
  name: "Haakon, Stromgald Scourge",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Knight"],
  power: 3,
  toughness: 3,
  text: "You may cast this card from your graveyard, but not from anywhere else.\nAs long as Haakon is on the battlefield, you may cast Knight spells from your graveyard.\nWhen Haakon dies, you lose 2 life.",
  castFromGraveyardIf: ALWAYS,
  castOnlyIf: { kind: "source-zone", zones: ["graveyard"] },
  static: [
    {
      affects: { scope: "self" },
      castFromGraveyard: { filter: { subtype: "Knight" } },
      text: "As long as Haakon is on the battlefield, you may cast Knight spells from your graveyard.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 2 },
      resolve: null,
      text: "When Haakon dies, you lose 2 life.",
    },
  ],
});
