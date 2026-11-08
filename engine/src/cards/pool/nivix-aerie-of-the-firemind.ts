import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

const TEXT =
  "{2}{U}{R}, {T}: Exile the top card of your library. Until your next turn, you may cast it if it's an instant or sorcery spell.";

export default defineCard({
  name: "Nivix, Aerie of the Firemind",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${TEXT}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{2}{U}{R}", tap: true },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        duration: "until-your-next-turn",
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
