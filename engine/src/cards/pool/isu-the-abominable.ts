import { defineCard } from "../define.js";

// EDHREC rank 18048.
//
// Looking at the top card any time is for Isu's controller alone. Snow lands
// come off the top with the land drop and snow spells keep every cost and
// timing rule (the rulings). Which of {G}, {W} or {U} to pay is the player's
// choice as the trigger resolves.
const LOOK_TEXT = "You may look at the top card of your library any time.";
const PLAY_TEXT = "You may play snow lands and cast snow spells from the top of your library.";
const COUNTER_TEXT =
  "Whenever another snow permanent you control enters, you may pay {G}, {W}, or {U}. If you do, put a +1/+1 counter on Isu.";

export default defineCard({
  name: "Isu the Abominable",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary", "snow"],
  types: ["creature"],
  subtypes: ["Yeti"],
  power: 5,
  toughness: 5,
  text: `${LOOK_TEXT}\n${PLAY_TEXT}\n${COUNTER_TEXT}`,
  looksAtOwnLibraryTop: true,
  static: [
    {
      affects: { scope: "self" },
      playFromLibraryTop: { type: "land", supertype: "snow" },
      castFromLibraryTop: { filter: { supertype: "snow" } },
      text: PLAY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { supertype: "snow" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          { pay: "{G}", text: "Pay {G}" },
          { pay: "{W}", text: "Pay {W}" },
          { pay: "{U}", text: "Pay {U}" },
        ],
        ifDid: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
