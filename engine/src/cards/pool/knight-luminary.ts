import { defineCard } from "../define.js";

// EDHREC rank 15800.

const ENTER_TEXT = "When this creature enters, create a 1/1 white Human Soldier creature token.";
const WARP_TEXT =
  "Warp {1}{W} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)";

export default defineCard({
  name: "Knight Luminary",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT}\n${WARP_TEXT}`,
  warp: { cost: "{1}{W}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
