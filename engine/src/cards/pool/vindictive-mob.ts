import { defineCard } from "../define.js";

// EDHREC rank 32070. Ravnica: City of Guilds.

const ETB_TEXT = "When this creature enters, sacrifice a creature.";
const STATIC_TEXT = "This creature can't be blocked by Saprolings.";

export default defineCard({
  name: "Vindictive Mob",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 5,
  toughness: 5,
  text: `${ETB_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { subtype: "Saproling" }, text: STATIC_TEXT }],
});
