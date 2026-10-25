import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Magic 2015 (M15). EDHREC rank 15774.
//
// The last ability works only from the graveyard, exiling the Soul as part
// of its cost (the rulings).

const RETURN = {
  kind: "sequence",
  simultaneous: true,
  effects: [
    { kind: "return-to-hand", target: 0, from: "graveyard" },
    { kind: "return-to-hand", target: 1, from: "graveyard" },
    { kind: "return-to-hand", target: 2, from: "graveyard" },
  ],
} as const;

const TARGETS = distinctTargets(3, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true });

export default defineCard({
  name: "Soul of Innistrad",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 6,
  toughness: 6,
  keywords: ["deathtouch"],
  text: "Deathtouch\n{3}{B}{B}: Return up to three target creature cards from your graveyard to your hand.\n{3}{B}{B}, Exile this card from your graveyard: Return up to three target creature cards from your graveyard to your hand.",
  activated: [
    {
      cost: { mana: "{3}{B}{B}", tap: false },
      targets: TARGETS,
      effect: RETURN,
      resolve: null,
      text: "{3}{B}{B}: Return up to three target creature cards from your graveyard to your hand.",
    },
    {
      cost: { mana: "{3}{B}{B}", tap: false },
      zone: "graveyard",
      targets: TARGETS,
      effect: RETURN,
      resolve: null,
      text: "{3}{B}{B}, Exile this card from your graveyard: Return up to three target creature cards from your graveyard to your hand.",
    },
  ],
});
