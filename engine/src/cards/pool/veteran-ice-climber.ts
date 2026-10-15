import { defineCard } from "../define.js";

// EDHREC rank 14329.

const ATTACK_TEXT =
  "Whenever this creature attacks, up to one target player mills cards equal to this creature's power.";

export default defineCard({
  name: "Veteran Ice Climber",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 1,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\nThis creature can't be blocked.\n${ATTACK_TEXT} (They put that many cards from the top of their library into their graveyard.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: "player" }],
      // Its power as the ability resolves — as it last existed, if it has left (608.2h).
      effect: { kind: "mill", target: 0, amount: { powerOf: "source" } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
});
