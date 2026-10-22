import { defineCard } from "../define.js";

// Amonkhet. Grisly Survivor's per-card discard trigger. "Another card" needs
// no filter: the trigger works only while this is on the battlefield, where
// it can't be cycled or discarded.
const TEXT = "Whenever you cycle or discard another card, this creature gets +2/+1 until end of turn.";

export default defineCard({
  name: "Horror of the Broken Lands",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 4,
  cycling: { cost: "{B}" },
  text: `${TEXT}\nCycling {B} ({B}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
