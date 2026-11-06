import { defineCard } from "../define.js";

// Mystery Booster Commander. Living weapon granted (rule 702.92a): each
// Equipment you control has the enters trigger, so one entering while Ekthi
// is out makes its Germ; one already out when Ekthi arrives doesn't.
const ANTHEM = "Other Phyrexians you control get +1/+1.";
const LIVING =
  "Each Equipment you control has living weapon. (Whenever an Equipment you control enters, create a 0/0 black Phyrexian Germ creature token, then attach that Equipment to it.)";

export default defineCard({
  name: "Ekthi, Contaminator Priest",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 3,
  toughness: 3,
  text: `${ANTHEM}\n${LIVING}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Phyrexian", excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM,
    },
    {
      affects: { scope: "filter", filter: { subtype: "Equipment", controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "create-token", token: "Phyrexian Germ Token", count: 1 },
              { kind: "attach", target: "created", attachment: "source" },
            ],
          },
          resolve: null,
          text: "Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)",
        },
      ],
      text: LIVING,
    },
  ],
});
