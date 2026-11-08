import { defineCard } from "../define.js";

// EDHREC rank 14314.
//
// The top card is the controller's to look at any time (rule 401.5's
// "look at"); a land comes off the top with a land play, and a spell keeps its
// timing and its costs. Casting and playing from the hand are barred (101.2) —
// a card's abilities from the hand (cycling, channel) aren't casting or
// playing it, and still work.
const LOOK_TEXT = "You may look at the top card of your library any time.";
const PLAY_TEXT = "You may play lands and cast spells from the top of your library.";
const LOCK_TEXT = "You can't play lands or cast spells from your hand.";
const DESTROY_TEXT = "{3}{R}: Destroy this enchantment.";

export default defineCard({
  name: "Experimental Frenzy",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${LOOK_TEXT}\n${PLAY_TEXT}\n${LOCK_TEXT}\n${DESTROY_TEXT}`,
  looksAtOwnLibraryTop: true,
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false },
      targets: [],
      effect: { kind: "destroy", target: "source" },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "library-top", play: true },
      text: PLAY_TEXT,
    },
    {
      affects: { scope: "self" },
      prohibits: { who: "you", spells: true, lands: {}, from: ["hand"] },
      text: LOCK_TEXT,
    },
  ],
});
