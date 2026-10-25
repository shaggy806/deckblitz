import { defineCard } from "../define.js";

// EDHREC rank 28837. The token ability works only on the battlefield (the
// ruling) — an ordinary activated ability.
const PUMP_TEXT = "Whenever another creature you control enters, this creature gets +1/+1 until end of turn.";
const TOKEN_TEXT = "{2}{W}, Exile a creature card from your graveyard: Create a 1/1 white Spirit creature token with flying.";

export default defineCard({
  name: "Sanctifier of Souls",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: `${PUMP_TEXT}\n${TOKEN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
