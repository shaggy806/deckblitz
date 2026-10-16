import { defineCard } from "../define.js";

// EDHREC rank 12626.
//
// An outlaw card is one with the Assassin, Mercenary, Pirate, Rogue or
// Warlock creature type (the ruling). Escape is Underworld Rage-Hound's, with
// its counter.
const ENTERS_TEXT = "When this creature enters, return target outlaw card from your graveyard to your hand.";

export default defineCard({
  name: "Charred Graverobber",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Mercenary"],
  power: 3,
  toughness: 1,
  text: `${ENTERS_TEXT}\nEscape—{3}{B}{B}, Exile four other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)\nThis creature escapes with a +1/+1 counter on it.`,
  escape: { cost: "{3}{B}{B}", exileCount: 4, counters: { kind: "+1/+1", amount: 1 } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtypes: ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"] },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
