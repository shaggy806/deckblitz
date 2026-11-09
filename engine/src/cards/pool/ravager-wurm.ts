import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, choose up to one —\n• This creature fights target creature you don't control.\n• Destroy target land with an activated ability that isn't a mana ability.";

// EDHREC rank 17647.
export default defineCard({
  name: "Ravager Wurm",
  manaCost: "{3}{R}{G}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 4,
  toughness: 5,
  keywords: ["riot"],
  text: `Riot (This creature enters with your choice of a +1/+1 counter or haste.)\n${TEXT}`,
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
            text: "This creature fights target creature you don't control.",
            targets: ["creature-an-opponent-controls"],
            effect: { kind: "fight", a: "source", b: 0 },
          },
          {
            text: "Destroy target land with an activated ability that isn't a mana ability.",
            targets: [{ kind: "permanent", filter: { type: "land", hasActivatedAbility: { mana: false } } }],
            effect: { kind: "destroy", target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
