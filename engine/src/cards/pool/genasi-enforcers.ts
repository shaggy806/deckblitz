import { defineCard } from "../define.js";
import { myriad } from "../helpers.js";

const MYRIAD_TEXT =
  "Myriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)";
const PUMP_TEXT = "{1}{R}: Creatures you control named Genasi Enforcers get +1/+0 until end of turn.";

export default defineCard({
  name: "Genasi Enforcers",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 1,
  toughness: 3,
  text: `${MYRIAD_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", name: "Genasi Enforcers" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [myriad()],
});
