import { defineCard } from "../define.js";

// "If it shares a card type" reads the spell you'd cast, not the card on top
// (the ruling): the `spell` clause, as the face cast.
const EXILE_TEXT = "Whenever this creature enters or attacks, exile a card from a graveyard.";
const CAST_TEXT = "Once each turn, you may cast a spell from the top of your library if it shares a card type with a card exiled with this creature.";

const EXILE = {
  kind: "look-and-choose",
  zone: "graveyards",
  min: 1,
  max: 1,
  destination: "exile",
  leftover: "stay",
} as const;

export default defineCard({
  name: "Cemetery Illuminator",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  looksAtOwnLibraryTop: true,
  text: `Flying\n${EXILE_TEXT}\nYou may look at the top card of your library any time.\n${CAST_TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: EXILE, resolve: null, text: EXILE_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: EXILE, resolve: null, text: EXILE_TEXT },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "library-top", spell: { sharesCardTypeWith: "exiled-with-source" }, oncePerTurn: true },
      text: CAST_TEXT,
    },
  ],
});
