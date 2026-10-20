import { defineCard } from "../define.js";
import { training } from "../helpers.js";

// EDHREC rank 9057.

const GRANT_TEXT =
  "Creature tokens you control have training. (Whenever a creature token you control attacks with another creature with greater power, put a +1/+1 counter on that token.)";

export default defineCard({
  name: "Elder Arthur Maxson",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 2,
  text: `${GRANT_TEXT}\nBlind Betrayal — Sacrifice another creature: Elder Arthur Maxson gains indestructible until end of turn.`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: true, controlledBy: "you" } },
      grantsTriggered: [training()],
      text: GRANT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Blind Betrayal — Sacrifice another creature: Elder Arthur Maxson gains indestructible until end of turn.",
      otherOnly: true,
    },
  ],
});
