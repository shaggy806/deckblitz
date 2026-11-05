import { defineCard } from "../define.js";

// "Choose artifact or enchantment" is asked as the mode resolves, as a choice
// between the two destructions.
const ONE = "{P} — Put a +1/+1 counter on a creature you control. It gains vigilance and trample until end of turn.";
const TWO = "{P}{P} — Choose artifact or enchantment. Destroy all permanents of the chosen type.";
const THREE = "{P}{P}{P} — Draw cards equal to the greatest power among creatures you control.";

export default defineCard({
  name: "Season of Gathering",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
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
        effect: {
          kind: "choose-permanents",
          filter: { type: "creature", controlledBy: "you" },
          min: 1,
          upTo: 1,
          prompt: "Choose a creature you control to put a +1/+1 counter on",
          then: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
              { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
              { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
            ],
          },
        },
      },
      {
        text: TWO,
        pawprints: 2,
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            { text: "Artifact — destroy all artifacts.", effect: { kind: "destroy-all", filter: { type: "artifact" } } },
            { text: "Enchantment — destroy all enchantments.", effect: { kind: "destroy-all", filter: { type: "enchantment" } } },
          ],
        },
      },
      {
        text: THREE,
        pawprints: 3,
        effect: {
          kind: "draw",
          amount: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
        },
      },
    ],
  },
});
