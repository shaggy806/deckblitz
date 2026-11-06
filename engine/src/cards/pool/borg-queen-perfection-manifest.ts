import { defineCard } from "../define.js";
import { ASSIMILATE } from "../helpers.js";

const ANTHEM = "Artifact creatures you control get +2/+0.";
const TRIGGER_TEXT =
  "When Borg Queen enters, assimilate target creature card from an opponent's graveyard. (Put it onto the battlefield under your control with a +1/+1 counter. It's a Borg artifact creature and loses all other creature types.)";

export default defineCard({
  name: "Borg Queen, Perfection Manifest",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Borg", "Noble"],
  power: 1,
  toughness: 4,
  text: `${ANTHEM}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantPt: [2, 0],
      text: ANTHEM,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true, ...ASSIMILATE },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
