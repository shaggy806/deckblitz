import { defineCard } from "../define.js";
import { ASSIMILATE } from "../helpers.js";

const STATIC_TEXT = "Artifact creatures you control have indestructible.";
const TRIGGER_TEXT =
  "At the beginning of your end step, assimilate target creature card from a graveyard. (Put it onto the battlefield under your control with a +1/+1 counter. It's a Borg artifact creature and loses all other creature types.)";

export default defineCard({
  name: "Death Is Irrelevant",
  manaCost: "{6}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${STATIC_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantKeywords: ["indestructible"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true, ...ASSIMILATE },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
