import { defineCard } from "../define.js";

// The token copies the card as printed (`asCard`, a ruling). "Artifact in
// addition" is a copy exception, so a copy of the token is an artifact too;
// haste and the sacrifice are an effect on the token, so that copy has neither
// (a ruling). Every token a replacement adds has both (a ruling).

const ABILITY =
  "{2}{R}, {T}: Create a token that's a copy of target creature card in your graveyard, except it's an artifact in addition to its other types. It gains haste. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Feldon of the Third Path",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 3,
  text: ABILITY,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        asCard: true,
        exceptions: { addTypes: ["artifact"] },
        gains: { keywords: ["haste"] },
        sacrificeAtEndStep: true,
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
