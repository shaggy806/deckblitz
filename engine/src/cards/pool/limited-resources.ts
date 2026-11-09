import { defineCard } from "../define.js";

const ENTER_TEXT = "When this enchantment enters, each player chooses five lands they control and sacrifices the rest.";
const LOCK_TEXT = "Players can't play lands as long as ten or more lands are on the battlefield.";

export default defineCard({
  name: "Limited Resources",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${LOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-all-but", who: "each-player", keep: 5, filter: { type: "land" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 10, anyController: true },
      prohibits: [{ act: "play-land", who: "each-player" }],
      text: LOCK_TEXT,
    },
  ],
});
