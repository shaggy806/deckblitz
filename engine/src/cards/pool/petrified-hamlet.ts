import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 9138. The name is chosen as the enters trigger resolves, not
// as it enters, and kept on this land for its other abilities.

const NAME = "When this land enters, choose a land card name.";
const LOCK = "Activated abilities of sources with the chosen name can't be activated unless they're mana abilities.";
const GRANT = 'Lands with the chosen name have "{T}: Add {C}."';

export default defineCard({
  name: "Petrified Hamlet",
  types: ["land"],
  text: `${NAME}\n${LOCK}\n${GRANT}\n{T}: Add {C}.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "choose-card-name", filter: { types: ["land"] }, aim: "opponent-permanents", remember: true },
      resolve: null,
      text: NAME,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: {
        who: "each-player",
        abilitiesOf: { chosenName: true },
        anyZone: true,
        exceptManaAbilities: true,
      },
      text: LOCK,
    },
    {
      affects: { scope: "filter", filter: { type: "land", chosenName: true } },
      grantsActivated: [addManaAbility({ mana: "C", text: "{T}: Add {C}." })],
      text: GRANT,
    },
  ],
  activated: [addManaAbility({ mana: "C", text: "{T}: Add {C}." })],
});
