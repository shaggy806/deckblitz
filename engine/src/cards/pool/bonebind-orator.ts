import { defineCard } from "../define.js";

// Bloomburrow (BLB). EDHREC rank 12635. Theoretical Necromancer's graveyard ability:
// `zone: "graveyard"` pays by exiling the card itself.
const TEXT =
  "{3}{B}, Exile this card from your graveyard: Return another target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Bonebind Orator",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Squirrel", "Warlock", "Bard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      zone: "graveyard",
      targets: [{ kind: "other", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
