import { defineCard } from "../define.js";

// EDHREC rank 21058.

const EXPLORE_TEXT =
  "Whenever Captain Janeway or another creature you control enters, that creature explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on the creature, then put the card back or put it into your graveyard.)";

export default defineCard({
  name: "Captain Kathryn Janeway",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 3,
  text: `You may play an additional land on each of your turns.\n${EXPLORE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "explore", target: "trigger-object" },
      resolve: null,
      text: EXPLORE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      extraLandsPerTurn: 1,
      text: "You may play an additional land on each of your turns.",
    },
  ],
});
