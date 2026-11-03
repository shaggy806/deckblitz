import { defineCard } from "../define.js";

// Modern Horizons.
//
// "Whenever you or a permanent you control becomes the target": a `becomes-target` trigger on a
// permanent you control that also watches you as a player (`player: "you"`) — once for each of
// them a spell or ability targets. The counter is ward's (`targetedBy`).

const TRIGGER_TEXT =
  "Whenever you or a permanent you control becomes the target of a spell or ability an opponent controls, counter that spell or ability unless its controller pays {1}.";

export default defineCard({
  name: "Unsettled Mariner",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 2,
  keywords: ["changeling"],
  text: `Changeling (This card is every creature type.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", player: "you", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{1}" } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
