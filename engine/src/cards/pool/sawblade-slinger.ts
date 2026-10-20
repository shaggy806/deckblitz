import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, choose up to one —\n" +
  "• Destroy target artifact an opponent controls.\n" +
  "• This creature fights target Zombie an opponent controls.";

export default defineCard({
  name: "Sawblade Slinger",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 0,
        maxModes: 1,
        modes: [
          {
            targets: [{ kind: "permanent", whose: "opponent", filter: { type: "artifact" } }],
            effect: { kind: "destroy", target: 0 },
            text: "Destroy target artifact an opponent controls.",
          },
          {
            targets: [{ kind: "permanent", whose: "opponent", filter: { subtype: "Zombie" } }],
            effect: { kind: "fight", a: "source", b: 0 },
            text: "This creature fights target Zombie an opponent controls.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
