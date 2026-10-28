import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 11993.
//
// "He becomes a land" replaces his card types (`add-types`' setTypes — his creature
// types go with the creature type), and the mana ability is granted for the same
// while: both until his controller's next turn begins.
//
// Rulings:
//   [2025-09-19] After the triggered ability resolves during your end step, however, you may tap
//     him for {U}, even if he entered the battlefield this turn.
//   [2025-09-19] The effect of Hydro-Man's last ability ends as your turn begins. There is no
//     opportunity to tap Hydro-Man for {U} once your turn has started.

const PUMP_TEXT = "Whenever you cast a blue spell, if Hydro-Man is a creature, he gets +1/+1 until end of turn.";
const LAND_TEXT =
  'At the beginning of your end step, untap Hydro-Man. Until your next turn, he becomes a land and gains "{T}: Add {U}." (He\'s not a creature during that time.)';

export default defineCard({
  name: "Hydro-Man, Fluid Felon",
  manaCost: "{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Villain"],
  power: 2,
  toughness: 2,
  text: `${PUMP_TEXT}\n${LAND_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      condition: { kind: "source", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "source" },
          { kind: "add-types", target: "source", setTypes: ["land"], duration: "until-your-next-turn" },
          {
            kind: "grant-activated",
            target: "source",
            ability: addManaAbility({ mana: "U", text: "{T}: Add {U}." }),
            duration: "until-your-next-turn",
          },
        ],
      },
      resolve: null,
      text: LAND_TEXT,
    },
  ],
});
