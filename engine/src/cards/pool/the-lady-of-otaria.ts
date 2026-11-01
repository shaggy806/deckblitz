import { defineCard } from "../define.js";

// EDHREC rank 24767. "A land you controlled was put into a graveyard from
// the battlefield this turn" looks back (rule 603.10a): every graveyard's
// arrivals from the battlefield, each land matched as it last existed there,
// controlled by you then — though it's an opponent's card, a token, or has
// left the graveyard since. An intervening "if" (rule 603.4) on every end
// step, not only yours. The alternative cost taps three untapped Dwarves you
// control, summoning-sick ones too (no {T} symbol — rule 302.6).

const ALT = "You may tap three untapped Dwarves you control rather than pay this spell's mana cost.";
const END =
  "At the beginning of each end step, if a land you controlled was put into a graveyard from the battlefield this turn, reveal the top four cards of your library. You may put any number of Dwarf cards from among them into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "The Lady of Otaria",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 5,
  toughness: 5,
  text: `${ALT}\n${END}`,
  alternativeCost: {
    mana: "{0}",
    tapCreatures: { count: 3, filter: { type: "creature", subtype: "Dwarf" } },
  },
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      condition: {
        kind: "turn-history",
        what: "to-graveyard",
        who: "any-player",
        from: ["battlefield"],
        filter: { type: "land", controlledBy: "you" },
      },
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: true,
        min: 0,
        max: 4,
        filter: { subtype: "Dwarf" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: END,
    },
  ],
});
