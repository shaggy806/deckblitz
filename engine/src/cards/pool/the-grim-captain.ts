import { defineCard } from "../define.js";

// The card entering attacks whichever player, planeswalker or battle you choose
// as it enters, and was never declared an attacker (the rulings).
const TEXT =
  "Whenever The Grim Captain attacks, each opponent sacrifices a nonland permanent of their choice. Then you may put an exiled creature card used to craft The Grim Captain onto the battlefield under your control tapped and attacking.";

export default defineCard({
  name: "The Grim Captain",
  art: "https://cards.scryfall.io/art_crop/back/c/1/c13e8e3d-2a6b-4782-a3c9-71af7336a881.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Skeleton", "Spirit", "Pirate"],
  power: 7,
  toughness: 7,
  keywords: ["menace", "trample", "lifelink", "hexproof"],
  text: `Menace, trample, lifelink, hexproof\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "each-opponent", filter: { notTypes: ["land"] }, count: 1 },
          {
            kind: "look-and-choose",
            zone: "exiled-with-source",
            min: 0,
            max: 1,
            filter: { type: "creature" },
            destination: "battlefield",
            enterTapped: true,
            attacking: "choose",
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Throne of the Grim Captain", "The Grim Captain"],
  transform: true,
});
