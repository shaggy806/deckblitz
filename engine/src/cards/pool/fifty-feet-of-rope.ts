import { defineCard } from "../define.js";

// Rulings:
//   [2021-07-23] Activating the Climb Over ability after a Wall has blocked won't change or undo
//     that block.
//   [2021-07-23] The Tie Up ability doesn't tap the creature, it just prevents it from untapping
//     if it is already tapped or becomes tapped through some other means.

const CLIMB_TEXT = "Climb Over — {T}: Target Wall can't block this turn.";
const TIE_TEXT = "Tie Up — {3}, {T}: Target creature doesn't untap during its controller's next untap step.";
const RAPPEL_TEXT = "Rappel Down — {4}, {T}: Venture into the dungeon. Activate only as a sorcery.";

export default defineCard({
  name: "Fifty Feet of Rope",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${CLIMB_TEXT}\n${TIE_TEXT}\n${RAPPEL_TEXT} (Enter the first room or advance to the next room.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Wall" } }],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: CLIMB_TEXT,
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: TIE_TEXT,
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: RAPPEL_TEXT,
      sorcerySpeed: true,
    },
  ],
});
