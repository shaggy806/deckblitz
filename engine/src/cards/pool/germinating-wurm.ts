import { defineCard } from "../define.js";

// EDHREC rank 17028.

const ENTER_TEXT = "When this creature enters, you gain 2 life.";
const WARP_TEXT =
  "Warp {1}{G} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)";

export default defineCard({
  name: "Germinating Wurm",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Wurm"],
  power: 5,
  toughness: 5,
  text: `${ENTER_TEXT}\n${WARP_TEXT}`,
  warp: { cost: "{1}{G}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
