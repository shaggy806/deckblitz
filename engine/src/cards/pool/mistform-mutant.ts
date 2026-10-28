import { CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 22975. Imagecrafter's ability at {1}{U}.

const TEXT = "{1}{U}: Choose a creature type other than Wall. Target creature becomes that type until end of turn.";

export default defineCard({
  name: "Mistform Mutant",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion", "Mutant"],
  power: 3,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "choose-creature-type",
        exclude: ["Wall"],
        then: { kind: "add-types", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
