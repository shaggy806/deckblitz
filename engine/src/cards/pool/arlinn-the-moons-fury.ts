import { defineCard } from "../define.js";

/** The nightbound back face of Arlinn, the Pack's Hope.
 *
 * Its 0 sets its card type (rule 205.1a: not "in addition to its other
 * types", not "still a planeswalker"): a 5/5 Werewolf creature until end of
 * turn, no longer a planeswalker, so damage dealt to it removes no loyalty
 * counters; still legendary. */
const ZERO_TEXT = "0: Until end of turn, Arlinn becomes a 5/5 Werewolf creature with trample, indestructible, and haste.";

export default defineCard({
  name: "Arlinn, the Moon's Fury",
  art: "https://cards.scryfall.io/art_crop/back/5/0/50d4b0df-a1d8-494f-a019-70ce34161320.jpg",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Arlinn"],
  loyalty: 4,
  keywords: ["nightbound"],
  text: `Nightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)\n+2: Add {R}{G}.\n${ZERO_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["R", "G"] }, amount: 1 },
      resolve: null,
      text: "+2: Add {R}{G}.",
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        power: 5,
        toughness: 5,
        setTypes: ["creature"],
        addSubtypes: ["Werewolf"],
        keywords: ["trample", "indestructible", "haste"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ZERO_TEXT,
    },
  ],
  faces: ["Arlinn, the Pack's Hope", "Arlinn, the Moon's Fury"],
  transform: true,
});
