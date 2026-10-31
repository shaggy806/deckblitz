import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// The graveyard is exiled with this Vehicle (rule 607.2a), and only those
// cards can come back, under your control (110.2a), whoever owned them. Its
// ruling: one that left and came back is a new object (400.7) and reaches
// none of the cards it exiled before.

const ENTER = "When this Vehicle enters, exile target player's graveyard.";
const HIT =
  "Whenever this Vehicle deals combat damage to a player, you may put a creature card exiled with this Vehicle onto the battlefield under your control.";

export default defineCard({
  name: "Nautiloid Ship",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ENTER}\n${HIT}\n${crewText(3)}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "exile-graveyard", target: 0, linked: true },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        leftover: "stay",
      },
      resolve: null,
      text: HIT,
    },
  ],
  activated: [crew(3, crewText(3))],
});
