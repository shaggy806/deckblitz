import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 17709. Bonebind Orator's graveyard
// ability (`zone: "graveyard"` pays by exiling the card itself), on an enters
// mill.
const ENTER_TEXT = "When this creature enters, mill three cards.";
const GRAVE_TEXT =
  "{4}{B}, Exile this card from your graveyard: Return another target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Eerie Soultender",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 3,
  toughness: 1,
  text: `${ENTER_TEXT} (Put the top three cards of your library into your graveyard.)\n${GRAVE_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{B}", tap: false },
      zone: "graveyard",
      targets: [{ kind: "other", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: GRAVE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
