import { defineCard } from "../define.js";

// Marvel: Darkhold Destiny (preview). Season of the Burrow's pawprint shape;
// each chosen instance of a targeted mode has its own target.
const ONE = "{P} — Target creature gets +1/+0 and gains deathtouch until end of turn.";
const TWO =
  "{P}{P} — Until end of turn, target creature gains \"When this creature dies, return it to the battlefield tapped under its owner's control.\"";
const THREE = "{P}{P}{P} — Destroy each non-Zombie creature with power 3 or less.";

export default defineCard({
  name: "Hela's Arcanum",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: `Choose up to five {P} worth of modes. You may choose the same mode more than once.\n${ONE}\n${TWO}\n${THREE}`,
  castModal: {
    minModes: 0,
    maxModes: 5,
    pawprintBudget: 5,
    repeatModes: true,
    modes: [
      {
        text: ONE,
        pawprints: 1,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: TWO,
        pawprints: 2,
        targets: ["creature"],
        effect: {
          kind: "grant-triggered",
          target: 0,
          duration: "end-of-turn",
          ability: {
            trigger: { on: "dies", who: "self" },
            targets: [],
            effect: { kind: "put-onto-battlefield", target: "trigger-object", enterTapped: true },
            resolve: null,
            text: "When this creature dies, return it to the battlefield tapped under its owner's control.",
          },
        },
      },
      {
        text: THREE,
        pawprints: 3,
        effect: {
          kind: "destroy-all",
          filter: { type: "creature", notSubtypes: ["Zombie"], power: { op: "lte", n: 3 } },
        },
      },
    ],
  },
});
