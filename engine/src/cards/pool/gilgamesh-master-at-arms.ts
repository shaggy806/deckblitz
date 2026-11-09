import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 4550. A reflexive trigger (rule 603.12), remembering what this
// one put; which Equipment goes first, then which Samurai, as printed.
const TEXT =
  "Whenever Gilgamesh enters or attacks, look at the top six cards of your library. You may put any number of Equipment cards from among them onto the battlefield. Put the rest on the bottom of your library in a random order. When you put one or more Equipment onto the battlefield this way, you may attach one of them to a Samurai you control.";
const WHEN_TEXT =
  "When you put one or more Equipment onto the battlefield this way, you may attach one of them to a Samurai you control.";

const look: Omit<TriggeredAbility, "trigger"> = {
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        min: 0,
        max: 6,
        filter: { subtype: "Equipment" },
        destination: "battlefield",
        leftover: "bottom-random",
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "put-onto-battlefield", atLeast: 1 },
        then: {
          kind: "reflexive-trigger",
          remember: { equipment: { set: { thisWay: "put-onto-battlefield" } } },
          targets: [],
          effect: {
            kind: "attach",
            attachment: {
              choose: { inSet: { remembered: "equipment" } },
              prompt: "You may attach one of them to a Samurai you control",
              upTo: 1,
            },
            target: { among: { subtype: "Samurai", controlledBy: "you" }, prompt: "Choose a Samurai you control" },
          },
          text: WHEN_TEXT,
        },
      },
    ],
  },
  resolve: null,
  text: TEXT,
};

export default defineCard({
  name: "Gilgamesh, Master-at-Arms",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Samurai"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, ...look },
    { trigger: { on: "attacks", who: "self" }, ...look },
  ],
});
