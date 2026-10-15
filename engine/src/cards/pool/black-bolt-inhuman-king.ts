import { defineCard } from "../define.js";

// EDHREC rank 20569.
//
// Lethal Voice's "that player" is whoever controls the spell or ability that
// targeted Black Bolt — the trigger's player (`whose: "trigger-player"`). Its
// one target is that player's nonland permanent; the player isn't targeted.
const PUMP_TEXT = "Whenever you cast a noncreature spell, Black Bolt gets +2/+2 until end of turn.";
const VOICE_TEXT =
  "Lethal Voice — Whenever Black Bolt becomes the target of a spell or ability an opponent controls, destroy target nonland permanent that player controls.";

export default defineCard({
  name: "Black Bolt, Inhuman King",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Inhuman", "Noble", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}\n${VOICE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { notTypes: ["land"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: VOICE_TEXT,
    },
  ],
});
