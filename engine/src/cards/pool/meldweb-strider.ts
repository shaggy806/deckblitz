import { defineCard } from "../define.js";

// EDHREC rank 25321.

const ENTERS_TEXT = "This Vehicle enters with an oil counter on it.";
const ANIMATE_TEXT = "Remove an oil counter from this Vehicle: It becomes an artifact creature until end of turn.";

export default defineCard({
  name: "Meldweb Strider",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${ENTERS_TEXT}\n${ANIMATE_TEXT}\nCrew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 1 } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "oil", count: 1 } },
      targets: [],
      effect: { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      text: ANIMATE_TEXT,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 3, filter: { type: "creature" } },
      },
      targets: [],
      effect: { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      crew: true,
      text: "Crew 3",
    },
  ],
});
