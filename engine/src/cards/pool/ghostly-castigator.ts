import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this creature enters, you may shuffle up to three target cards from your graveyard into your library.";
const EXILE_TEXT = "If Ghostly Castigator would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Ghostly Castigator",
  art: "https://cards.scryfall.io/art_crop/back/4/f/4ff66f14-aee6-4ad2-be70-1c9bb39089b3.jpg",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" }, max: 3 }],
      effect: {
        kind: "may",
        prompt: "Shuffle the targeted cards from your graveyard into your library?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "for-each-target",
              from: 0,
              simultaneous: true,
              effect: { kind: "put-on-library", target: 0, position: "top" },
            },
            { kind: "shuffle-library" },
          ],
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  faces: ["Covetous Castaway", "Ghostly Castigator"],
  transform: true,
});
