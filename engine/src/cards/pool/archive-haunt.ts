import { defineCard } from "../define.js";

/** The disturb back face of Overwhelmed Archivist. */
export default defineCard({
  name: "Archive Haunt",
  art: "https://cards.scryfall.io/art_crop/back/8/3/832288fd-8031-4c2b-ad3e-b1ec9f94d379.jpg",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, draw a card, then discard a card.\nIf Archive Haunt would be put into a graveyard from anywhere, exile it instead.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "Whenever this creature attacks, draw a card, then discard a card.",
    },
  ],
  faces: ["Overwhelmed Archivist", "Archive Haunt"],
  transform: true,
  disturb: { cost: "{3}{U}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: "If Archive Haunt would be put into a graveyard from anywhere, exile it instead.",
    },
  ],
});
