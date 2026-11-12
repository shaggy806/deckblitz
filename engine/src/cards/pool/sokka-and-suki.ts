import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 15295.

const ATTACH_TEXT =
  "Whenever Sokka and Suki or another Ally you control enters, attach up to one target Equipment you control to that creature.";

export default defineCard({
  name: "Sokka and Suki",
  manaCost: "{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 3,
  toughness: 3,
  text: `${ATTACH_TEXT}\nWhenever an Equipment you control enters, create a 1/1 white Ally creature token.`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "you", filter: { subtype: "Equipment" } } }],
      effect: { kind: "attach", target: "trigger-object", attachment: 0 },
      resolve: null,
      text: ATTACH_TEXT,
    }),
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Equipment" } },
      targets: [],
      effect: { kind: "create-token", token: "Ally Token", count: 1 },
      resolve: null,
      text: "Whenever an Equipment you control enters, create a 1/1 white Ally creature token.",
    },
  ],
});
