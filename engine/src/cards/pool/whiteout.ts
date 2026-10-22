import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 25125.

const RETURN_TEXT = "Sacrifice a snow land: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Whiteout",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `All creatures lose flying until end of turn.\n${RETURN_TEXT}`,
  targets: [],
  effect: { kind: "lose-keywords", filter: { type: "creature" }, keywords: ["flying"], duration: "end-of-turn" },
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "land", supertype: "snow" } } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
