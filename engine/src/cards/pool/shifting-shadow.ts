import { defineCard } from "../define.js";

// EDHREC rank 15147. "Shifting Shadow" in the granted trigger is the Aura
// that grants it (rule 201.5a): `attachment: "granter"`, read through the
// trigger's recorded granter. "This creature" is the enchanted creature, the
// trigger's source; it's destroyed first, so the Aura is attached to nothing
// for the moment (no state-based actions mid-resolution, rule 704.3) and then
// moves to the creature found (rule 701.3a). The rulings:
//   - It can't become attached to the new creature (protection from red): it
//     attaches to nothing and goes to the graveyard as a state-based action
//     (rule 704.5m) — an illegal attach does nothing (rule 701.3b).
//   - No creature card revealed: the library is revealed and randomized, and
//     the Aura is put into the graveyard the same way.
//   - The enchanted creature can't be destroyed: you still get a new creature
//     and attach the Aura to it.
//   - The Aura leaves after the trigger and before it resolves: the creature
//     is still destroyed and a creature card put onto the battlefield, but the
//     Aura isn't attached to it (rule 400.7 — `granterLost`).

const GRANTED =
  "At the beginning of your upkeep, destroy this creature. Reveal cards from the top of your library until you reveal a creature card. Put that card onto the battlefield and attach Shifting Shadow to it, then put all other cards revealed this way on the bottom of your library in a random order.";
const TEXT = `Enchanted creature has haste and "${GRANTED}"`;

export default defineCard({
  name: "Shifting Shadow",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["haste"],
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "destroy", target: "source" },
              {
                kind: "reveal-until",
                filter: { type: "creature" },
                put: "battlefield",
                then: { kind: "attach", attachment: "granter", target: 0 },
                rest: "bottom-random",
              },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
