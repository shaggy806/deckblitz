import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 11565.

const GRANT_TEXT =
  'Equipped creature has "You may look at the top card of your library any time" and "Whenever this creature attacks, it explores." (Reveal the top card of your library. Put that card into your hand if it\'s a land. Otherwise, put a +1/+1 counter on that creature, then put the card back or put it into your graveyard.)';

export default defineCard({
  name: "Glowcap Lantern",
  manaCost: "{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${GRANT_TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantsStatic: [
        {
          affects: { scope: "self" },
          visibility: { looksAtOwnLibraryTop: true },
          text: "You may look at the top card of your library any time.",
        },
      ],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "explore", target: "source" },
          resolve: null,
          text: "Whenever this creature attacks, it explores.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
