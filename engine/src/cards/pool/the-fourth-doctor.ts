import { defineCard } from "../define.js";

// EDHREC rank 10460. "Once each turn, you may play a historic land or cast a
// historic spell from the top of your library" is a `mayPlay` from the top
// of the library with `play: true` and `oncePerTurn` — one play a turn,
// land or spell. "When you do" is a `plays-card` trigger narrowed to a card
// played under this permanent's own permission in its present stint
// (`underThis`, as Share the Spoils' "when they do"): never one played from
// the top through another permission. Which permission a play is made under,
// when several reach the card (Courser of Kruphix, Crystal Skull), is the
// player's: an offer under each (`Game.playGrantChoices`).

const LOOK = "You may look at the top card of your library any time.";
const PLAY =
  "Would You Like A...? — Once each turn, you may play a historic land or cast a historic spell from the top of your library.";
const FOOD = "When you do, create a Food token.";
const HISTORIC = { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] } as const;

export default defineCard({
  name: "The Fourth Doctor",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 4,
  toughness: 4,
  text: `${LOOK}\n${PLAY} ${FOOD} (Artifacts, legendaries, and Sagas are historic.)`,
  looksAtOwnLibraryTop: true,
  triggered: [
    {
      trigger: { on: "plays-card", who: "you", underThis: true },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: FOOD,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "library-top", play: true, filter: HISTORIC, oncePerTurn: true },
      text: PLAY,
    },
  ],
});
