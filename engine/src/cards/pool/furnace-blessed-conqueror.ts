import { defineCard } from "../define.js";

// The token copies the face that's up (rule 707.8a — this face's copiable
// values), not whether it's tapped, its counters or any non-copy effect (the
// ruling); it enters tapped and attacking whoever its controller picks
// (rule 508.4 — never declared, so no attack trigger sees it, its own
// included). "That token" is the one this resolution made (`thisWay:
// "created"`), getting a +1/+1 counter for each on this creature as it is now
// — or as it last existed on the battlefield, if it's gone (rule 608.2h).
//
// Rulings:
//   [2023-04-14] Although the token enters the battlefield attacking, it was never declared as an
//     attacking creature (for the purposes of abilities that trigger whenever a creature attacks,
//     such as its own ability, for example).
//   [2023-04-14] The token will enter the battlefield and then have counters put on it. In most
//     cases, the game will see a 3/3 creature entering the battlefield for the purposes of any
//     abilities that may trigger.
//   [2023-04-14] The token doesn't copy whether Furnace-Blessed Conqueror is tapped or untapped
//     (although the effect itself causes it to enter tapped), whether it has any counters on it or
//     Auras and Equipment attached to it, or any non-copy effects that have changed its power,
//     toughness, types, color, and so on.

const ATTACK_TEXT =
  "Whenever this creature attacks, create a tapped and attacking token that's a copy of it. Put a +1/+1 counter on that token for each +1/+1 counter on this creature. Sacrifice that token at the beginning of the next end step.";

export default defineCard({
  name: "Furnace-Blessed Conqueror",
  art: "https://cards.scryfall.io/art_crop/back/6/3/630ce82b-0d09-4a12-8cba-0b0ed8415128.jpg",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 3,
  toughness: 3,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "create-token-copy",
            of: "source",
            count: 1,
            who: "you",
            tapped: true,
            attacking: "choose",
            sacrificeAtEndStep: true,
          },
          {
            kind: "add-counter-all",
            filter: { thisWay: "created" },
            counter: "+1/+1",
            amount: { countersOn: "source", counter: "+1/+1" },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Sun-Blessed Guardian", "Furnace-Blessed Conqueror"],
  transform: true,
});
