import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 25699.

const FLY_TEXT = "{T}: Target creature gains flying until end of turn.";
const UNTAP_TEXT = "Whenever you cast a blue spell, you may untap this creature.";

export default defineCard({
  name: "Merrow Levitator",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${FLY_TEXT}\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: FLY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      targets: [],
      effect: { kind: "may", prompt: "Untap Merrow Levitator?", effect: { kind: "untap", target: "source" } },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
