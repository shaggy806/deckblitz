import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 9989. Everything returns in one event.
const ETB_TEXT = "When this creature enters, return all other nonland permanents to their owners' hands.";

export default defineCard({
  name: "Kederekt Leviathan",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 5,
  toughness: 5,
  text: `${ETB_TEXT}\nUnearth {6}{U} ({6}{U}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)`,
  activated: [unearth("{6}{U}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { notTypes: ["land"] },
        exceptSource: true,
        simultaneous: true,
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
