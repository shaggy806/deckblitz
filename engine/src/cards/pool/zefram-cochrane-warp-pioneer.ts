import { defineCard } from "../define.js";

const CAST_TEXT = "Once during each of your turns, you may cast an artifact spell from the top of your library.";
const SPACECRAFT_TEXT = "Spacecraft you control enter with two additional charge counters on them.";

export default defineCard({
  name: "Zefram Cochrane, Warp Pioneer",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 2,
  toughness: 3,
  looksAtOwnLibraryTop: true,
  text: `You may look at the top card of your library any time.\n${CAST_TEXT}\n${SPACECRAFT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "library-top", spell: { type: "artifact" }, oncePerTurn: true, yourTurnOnly: true },
      text: CAST_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { subtype: "Spacecraft", controlledBy: "you" },
        counters: { kind: "charge", amount: 2 },
      },
      text: SPACECRAFT_TEXT,
    },
  ],
});
