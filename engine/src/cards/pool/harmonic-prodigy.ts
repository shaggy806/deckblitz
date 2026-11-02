import { defineCard } from "../define.js";

// "Another" only on the Wizard half: this is a Wizard itself, so its own prowess
// isn't doubled by itself, but a second Harmonic Prodigy's is (and a Shaman's
// would be, were it to become one).

const TEXT = "If a triggered ability of a Shaman or another Wizard you control triggers, that ability triggers an additional time.";

export default defineCard({
  name: "Harmonic Prodigy",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: `Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess — whenever you cast a noncreature spell, Harmonic Prodigy gets +1/+1 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      doubleTriggersOf: {
        filter: { controlledBy: "you", anyOf: [{ subtype: "Shaman" }, { subtype: "Wizard", isSource: false }] },
      },
      text: TEXT,
    },
  ],
});
