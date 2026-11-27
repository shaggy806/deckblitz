import { CHOSEN_COLOR_AND_TYPE_TOKEN } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 22582.
//
// The colour, then the creature type, chosen as it enters (rule 614.12);
// the token is made that colour and type, named for the type, with no
// abilities of the type's (Volrath's Laboratory's rulings), X/X by the
// charge counters as the ability resolves.

const CHOOSE = "As this artifact enters, choose a color and a creature type.";
const ENTER = "This artifact enters with X charge counters on it.";
const MAKE =
  "{4}, {T}: Create an X/X creature token of the chosen color and type, where X is the number of charge counters on this artifact.";
const CHARGE = { countersOn: "source", counter: "charge" } as const;

export default defineCard({
  name: "Riptide Replicator",
  manaCost: "{X}{4}",
  colors: [],
  types: ["artifact"],
  text: `${CHOOSE}\n${ENTER}\n${MAKE}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  chooseCreatureTypeOnEnter: true,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: "x" } },
      text: ENTER,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: CHOSEN_COLOR_AND_TYPE_TOKEN,
        count: 1,
        ofChosenColorAndType: true,
        basePt: { power: CHARGE, toughness: CHARGE },
      },
      resolve: null,
      text: MAKE,
    },
  ],
});
