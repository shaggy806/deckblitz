import { defineCard } from "../define.js";

// EDHREC rank 18827.
//
// The surveil trigger works only from the graveyard (`fromGraveyard`), and
// fires once the surveil is done — so a Blood Operative that surveil put
// there sees it (the ruling). "If this card is in your graveyard" is an
// intervening if (rule 603.4), asked again as it resolves: Master of Death's
// shape.
const ENTERS_TEXT = "When this creature enters, you may exile target card from a graveyard.";
const SURVEIL_TEXT =
  "Whenever you surveil, if this card is in your graveyard, you may pay 3 life. If you do, return this card to your hand.";

export default defineCard({
  name: "Blood Operative",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Assassin"],
  power: 3,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${ENTERS_TEXT}\n${SURVEIL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "may",
        prompt: "Exile target card from a graveyard?",
        effect: { kind: "exile", target: 0 },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: { on: "surveils", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 3 life to return Blood Operative to your hand?",
        costLife: 3,
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});
