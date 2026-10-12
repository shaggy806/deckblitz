import { defineCard } from "../define.js";

// Saddled (rule 702.171b) without a saddle ability: nothing is tapped for
// it, so nothing "saddled it" (702.171c).
const DRAW_TEXT = "When this artifact enters, draw a card.";
const SADDLE_TEXT = "{2}, {T}: Target Mount you control becomes saddled until end of turn. Activate only as a sorcery.";
const VEHICLE_TEXT = "{2}, {T}: Target Vehicle you control becomes an artifact creature until end of turn.";

export default defineCard({
  name: "Guidelight Matrix",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${DRAW_TEXT}\n${SADDLE_TEXT}\n${VEHICLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Mount" } }],
      effect: { kind: "become-saddled", target: 0 },
      resolve: null,
      sorcerySpeed: true,
      text: SADDLE_TEXT,
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Vehicle" } }],
      effect: { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      text: VEHICLE_TEXT,
    },
  ],
});
