import { defineCard } from "../define.js";
import { CHOSEN_CREATURE_TYPE } from "../helpers.js";

// EDHREC rank 29971. Tideshaper Mystic's choice on resolution (rule 608.2d),
// narrowed to Plains or Island; the land loses its other land types and its
// rules-text abilities until end of turn (rule 305.7).

const TEXT = "{T}: Target land becomes a Plains or an Island until end of turn.";

export default defineCard({
  name: "Tundra Kavu",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: {
        kind: "choose-creature-type",
        options: ["Plains", "Island"],
        prompt: "Choose Plains or Island",
        then: { kind: "add-types", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
