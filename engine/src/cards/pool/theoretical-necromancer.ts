import { defineCard } from "../define.js";

// EDHREC rank 29391.
//
// "Another": targets are chosen before the cost exiles it (rule 601.2c
// before 601.2h), so it can't target itself.

const RETURN_TEXT =
  "{3}{B}, Exile this card from your graveyard: Return another target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Theoretical Necromancer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warlock"],
  power: 4,
  toughness: 1,
  text: RETURN_TEXT,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      zone: "graveyard",
      targets: [{ kind: "other", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
