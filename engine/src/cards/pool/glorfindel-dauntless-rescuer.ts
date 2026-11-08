import { defineCard } from "../define.js";

const MUST = "Glorfindel must be blocked this turn if able.";
const AT_MOST_ONE = "Glorfindel can't be blocked by more than one creature each combat this turn.";
const TEXT = "Whenever you scry, choose one and Glorfindel gets +1/+1 until end of turn.";

export default defineCard({
  name: "Glorfindel, Dauntless Rescuer",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 3,
  toughness: 2,
  text: `${TEXT}\n• ${MUST}\n• ${AT_MOST_ONE}`,
  triggered: [
    {
      trigger: { on: "scries", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modal",
            announced: true,
            minModes: 1,
            maxModes: 1,
            modes: [
              { text: MUST, effect: { kind: "restrict", target: "source", restrictions: ["must-be-blocked-if-able"] } },
              {
                text: AT_MOST_ONE,
                effect: {
                  kind: "grant-static",
                  target: "source",
                  ability: {
                    affects: { scope: "self" },
                    restrictions: [{ kind: "cant-be-blocked", byMoreThan: 1 }],
                    text: "This creature can't be blocked by more than one creature.",
                  },
                  duration: "end-of-turn",
                },
              },
            ],
          },
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
