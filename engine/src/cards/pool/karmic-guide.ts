import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 979.

export default defineCard({
  name: "Karmic Guide",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying, protection from black\nEcho {3}{W}{W} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nWhen this creature enters, return target creature card from your graveyard to the battlefield.",
  triggered: [
    echo("{3}{W}{W}"),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: "When this creature enters, return target creature card from your graveyard to the battlefield.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
