import { defineCard } from "../define.js";

// EDHREC rank 3020.
//
// Rulings: airbend's — its owner may cast the card from exile for {2} (an
// alternative cost: X is 0, additional costs still paid), a token exiled is
// gone, a land can't be played from there.
//
// "Any number of other target nonland permanents you control": one instruction
// over every one chosen, so they're exiled together (rule 603.10a). Casting
// one back for {2} is a spell cast from exile — Appa's last ability makes an
// Ally for it.
const ETB_TEXT = "When Appa enters, airbend any number of other target nonland permanents you control.";
const CAST_TEXT = "Whenever you cast a spell from exile, create a 1/1 white Ally creature token.";

export default defineCard({
  name: "Appa, Steadfast Guardian",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bison", "Ally"],
  power: 3,
  toughness: 4,
  keywords: ["flash", "flying"],
  text:
    `Flash\nFlying\n${ETB_TEXT} ` +
    `(Exile them. While each one is exiled, its owner may cast it for {2} rather than its mana cost.)\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "other", of: { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } } },
        },
      ],
      effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "exile", target: 0, airbend: true } },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", from: "exile" },
      targets: [],
      effect: { kind: "create-token", token: "Ally Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
