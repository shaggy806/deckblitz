import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, exile up to one target instant or sorcery card from your graveyard. You may cast that card until the end of your next turn. (You still pay its costs. Timing rules still apply.)";

export default defineCard({
  name: "Scholar of Combustion",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
        },
      ],
      effect: { kind: "exile", target: 0, mayCast: { duration: "your-next-turn" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
