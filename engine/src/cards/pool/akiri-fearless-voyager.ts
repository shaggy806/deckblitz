import { defineCard } from "../define.js";

// EDHREC rank 2078. One card a player attacked, however many equipped creatures
// attack them (the ruling). "That creature" is what the Equipment was on, read
// as `{ thisWay: "unattached-from" }`, so declining taps nothing.
const DRAW_TEXT = "Whenever you attack a player with one or more equipped creatures, draw a card.";
const UNATTACH_TEXT =
  "{W}: You may unattach an Equipment from a creature you control. If you do, tap that creature and it gains indestructible until end of turn.";

export default defineCard({
  name: "Akiri, Fearless Voyager",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Kor", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${DRAW_TEXT}\n${UNATTACH_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "attacks-player",
        who: "you",
        defender: "any",
        filter: { attachments: { filter: { subtype: "Equipment" } } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "unattach",
            target: {
              choose: { subtype: "Equipment", attachedTo: { type: "creature", controlledBy: "you" } },
              prompt: "You may unattach an Equipment from a creature you control",
              upTo: 1,
            },
          },
          { kind: "tap", target: { thisWay: "unattached-from" } },
          {
            kind: "grant-keyword",
            target: { thisWay: "unattached-from" },
            keyword: "indestructible",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: UNATTACH_TEXT,
    },
  ],
});
