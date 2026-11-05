import { defineCard } from "../define.js";

// "Play a land from exile or cast a spell from exile": a land played and a
// spell cast, the cast one including a copy cast from exile (the ruling),
// one ability with two trigger events.

const EXILE_TEXT = "Whenever you play a land from exile or cast a spell from exile, put a +1/+1 counter on Ghost-Spider.";
const REMOVE_TEXT = "Remove two counters from Ghost-Spider: Exile the top card of your library. You may play that card this turn.";
const counter = { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } as const;

export default defineCard({
  name: "Ghost-Spider",
  art: "https://cards.scryfall.io/art_crop/back/b/0/b0f1597f-1dc7-465e-8fcb-0afe61bcca46.jpg",
  manaCost: "{2}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance", "haste"],
  text: `Flying, vigilance, haste\n${EXILE_TEXT}\n${REMOVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "plays-card", who: "you", from: "exile", filter: { type: "land" } },
      targets: [],
      effect: counter,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", from: "exile" },
      sameAbilityAs: 0,
      targets: [],
      effect: counter,
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "any", count: 2 } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: REMOVE_TEXT,
    },
  ],
  faces: ["Gwen Stacy", "Ghost-Spider"],
});
