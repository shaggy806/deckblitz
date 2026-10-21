import { defineCard } from "../define.js";

// EDHREC rank 17033.
//
// "An artifact source" is any object with the card type artifact, in any
// zone (its ruling) — `sourceTypes` reads a card off the battlefield by its
// printed types and a departed permanent as it last existed.

const COPY_TEXT =
  "{U}{R}, {T}: Copy target activated or triggered ability you control from an artifact source. You may choose new targets for the copy. (Mana abilities can't be targeted.)";

export default defineCard({
  name: "Tawnos, Urza's Apprentice",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: "{U}{R}", tap: true },
      targets: [{ kind: "ability", whose: "you", sourceTypes: ["artifact"] }],
      effect: { kind: "copy-ability", target: 0, newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
