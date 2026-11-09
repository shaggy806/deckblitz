import { defineCard } from "../define.js";

const REPAIR_BARGE =
  "Repair Barge — Whenever this Vehicle becomes crewed, each artifact creature card in your graveyard gains unearth {3} until end of turn.";

// EDHREC rank 13881. Unearth goes to the cards in the graveyard as this
// resolves, not to later arrivals (its ruling).
export default defineCard({
  name: "Ghost Ark",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${REPAIR_BARGE}\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 0, totalPower: 2, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "become", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      crew: true,
      text: "Crew 2",
    },
  ],
  triggered: [
    {
      trigger: { on: "event", event: "becomes-crewed", who: "self" },
      targets: [],
      effect: {
        kind: "grant-graveyard-keyword",
        filter: { types: ["artifact", "creature"], ownedBy: "you" },
        grant: { keyword: "unearth", cost: "{3}" },
      },
      resolve: null,
      text: REPAIR_BARGE,
    },
  ],
});
