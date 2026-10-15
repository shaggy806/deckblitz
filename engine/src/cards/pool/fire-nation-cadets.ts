import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 12152.
//
// Rulings:
//   [2025-10-02] You must have a Lesson card in your graveyard while you attack with Fire Nation
//     Cadets in order for the firebending 2 ability to trigger. If you put a Lesson card into your
//     graveyard after Fire Nation Cadets has attacked, Fire Nation Cadets will still gain
//     firebending 2, but the ability will not trigger.
//
// A conditional grant of the triggered ability (layer 6): it exists only while
// the condition holds, so it triggers only if the Lesson is there as the
// creature attacks (the ruling).

const FIREBENDING_TEXT =
  "This creature has firebending 2 as long as there's a Lesson card in your graveyard. (Whenever this creature attacks, add {R}{R}. This mana lasts until end of combat.)";
const PUMP_TEXT = "{2}: This creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Fire Nation Cadets",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: `${FIREBENDING_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Lesson" } },
      grantsTriggered: [firebending(2, "Firebending 2")],
      text: FIREBENDING_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
