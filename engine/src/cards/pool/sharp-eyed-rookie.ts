import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

const TEXT =
  "Whenever a creature you control enters, if its power is greater than this creature's power or its toughness is greater than this creature's toughness, put a +1/+1 counter on this creature and investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

const BIGGER: CardFilter = {
  type: "creature",
  anyOf: [
    { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
    { toughness: { op: "gt", n: { amount: { toughnessOf: "source" } } } },
  ],
};

export default defineCard({
  name: "Sharp-Eyed Rookie",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      // An intervening "if" (rule 603.4): checked as the creature enters and
      // again as this resolves — the entered creature as it last existed if
      // it has left (the rulings) — either stat may be the bigger one then.
      trigger: { on: "enters-battlefield", who: "you-control", filter: BIGGER },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: BIGGER },
        then: {
          kind: "sequence",
          effects: [{ kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 }, investigate()],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
