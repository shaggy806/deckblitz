import { defineCard } from "../define.js";

// Adventures in the Forgotten Realms. Engulf exiles until the Cube leaves
// (rule 610.3); Dissolve targets a creature card "exiled with this creature"
// (`card-in-exile`'s `linked`, which reads cards exiled until it leaves too —
// rule 607.2a) whose mana value is the X paid. A card put into the graveyard
// this way doesn't come back when the Cube leaves. Engulf and Dissolve are
// ability words.
const ENGULF =
  "Engulf — When this creature enters, exile target non-Ooze creature an opponent controls until this creature leaves the battlefield.";
const DISSOLVE =
  "Dissolve — {X}{B}: Put target creature card with mana value X exiled with this creature into its owner's graveyard.";

export default defineCard({
  name: "Gelatinous Cube",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 4,
  toughness: 3,
  text: `${ENGULF}\n${DISSOLVE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", notSubtypes: ["Ooze"] } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENGULF,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}{B}", tap: false },
      targets: [
        { kind: "card-in-exile", linked: true, filter: { type: "creature", manaValue: { op: "eq", n: "x" } } },
      ],
      effect: { kind: "put-into-graveyard", target: 0 },
      resolve: null,
      text: DISSOLVE,
    },
  ],
});
