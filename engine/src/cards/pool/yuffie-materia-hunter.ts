import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

const ENTERS_TEXT =
  "When Yuffie enters, gain control of target noncreature artifact for as long as you control Yuffie. Then you may attach an Equipment you control to Yuffie.";

export default defineCard({
  name: "Yuffie, Materia Hunter",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 3,
  toughness: 3,
  text: `${ninjutsuText("{1}{R}")}\n${ENTERS_TEXT}`,
  activated: [ninjutsu("{1}{R}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
      // An illegal target stops the whole ability, the attach too (the
      // ruling). "You may attach an Equipment" is a choice of up to one; one
      // that can't equip Yuffie doesn't move (rule 701.3b).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
          {
            kind: "attach",
            target: "source",
            choose: {
              filter: { subtype: "Equipment", controlledBy: "you" },
              prompt: "You may attach an Equipment you control to Yuffie",
              upTo: 1,
            },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
