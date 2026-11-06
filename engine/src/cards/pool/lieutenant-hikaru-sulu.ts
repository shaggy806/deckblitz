import { defineCard } from "../define.js";

// EDHREC rank 31443.

const EXPLORE_TEXT =
  "Whenever Lieutenant Sulu becomes tapped, he explores. (Reveal the top card of your library. Put that card into " +
  "your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it " +
  "into your graveyard.)";
const UNBLOCKABLE_TEXT = "{2}{U}: Target creature can't be blocked this turn.";

export default defineCard({
  name: "Lieutenant Hikaru Sulu",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 3,
  toughness: 3,
  text: `${EXPLORE_TEXT}\n${UNBLOCKABLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "explore", target: "source" },
      resolve: null,
      text: EXPLORE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
  ],
});
