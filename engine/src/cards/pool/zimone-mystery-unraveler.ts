import { defineCard } from "../define.js";

const TEXT =
  "Landfall — Whenever a land you control enters, manifest dread if this is the first time this ability has resolved this turn. Otherwise, you may turn a permanent you control face up. (To manifest dread, look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Zimone, Mystery Unraveler",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "resolved-this-turn", n: 1 },
        then: { kind: "manifest-dread" },
        else: {
          kind: "choose-permanents",
          filter: { controlledBy: "you", faceDown: true },
          upTo: 1,
          then: { kind: "turn-face-up", target: 0 },
          prompt: "You may turn a permanent you control face up",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
