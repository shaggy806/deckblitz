import { defineCard } from "../define.js";

// EDHREC rank 5968.
//
// A meld card (rule 712.4): it and The Mightstone and Weakstone meld into
// Urza, Planeswalker. The activated ability's "if" is checked as it resolves
// (Hanweir Battlements' shape): the `meld` effect does nothing unless you
// both own and control this creature and an artifact of that name then.
//
// Rulings:
//   [2022-10-14] One card in each pair of meld cards has an ability that instructs you to exile
//     the two cards and meld them. If you control more than one object with one of those names,
//     you select one object with that name to exile.
//   [2022-10-14] In the Commander variant, a meld card's color identity is determined only by the
//     mana costs and mana symbols in the rules text of its front face.
const DISCOUNT_TEXT = "Artifact, instant, and sorcery spells you cast cost {1} less to cast.";
const MELD_TEXT =
  "{7}: If you both own and control Urza, Lord Protector and an artifact named The Mightstone and Weakstone, exile them, then meld them into Urza, Planeswalker. Activate only as a sorcery.";

export default defineCard({
  name: "Urza, Lord Protector",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  meldCard: true,
  power: 2,
  toughness: 4,
  text: `${DISCOUNT_TEXT}\n${MELD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { typesAnyOf: ["artifact", "instant", "sorcery"] }, reduceGeneric: 1, when: { caster: "you" } },
      text: DISCOUNT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{7}", tap: false },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "meld", partner: { name: "The Mightstone and Weakstone", type: "artifact" }, into: "Urza, Planeswalker" },
      resolve: null,
      text: MELD_TEXT,
    },
  ],
});
