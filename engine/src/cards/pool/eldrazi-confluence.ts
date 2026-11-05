import { defineCard } from "../define.js";

const PUMP = "Target creature gets +3/-3 until end of turn.";
const FLICKER = "Exile target nonland permanent, then return it to the battlefield tapped under its owner's control.";
const SCION = 'Create a 1/1 colorless Eldrazi Scion creature token with "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Eldrazi Confluence",
  manaCost: "{2}{C}{C}",
  colors: [],
  types: ["instant"],
  text: `Choose three. You may choose the same mode more than once.\n• ${PUMP}\n• ${FLICKER}\n• ${SCION}`,
  targets: [],
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      {
        text: PUMP,
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 3, toughness: -3, duration: "end-of-turn" },
      },
      {
        text: FLICKER,
        targets: ["nonland-permanent"],
        effect: { kind: "flicker", target: 0, tapped: true },
      },
      {
        text: SCION,
        effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 1 },
      },
    ],
  },
});
