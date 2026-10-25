import { defineCard } from "../define.js";

// Will of the council (rule 701.38): `vote-won` option 0 is "denial gets
// more votes"; anything else — duplication ahead, or a tie — copies the spell.
export default defineCard({
  name: "Split Decision",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Will of the council — Choose target instant or sorcery spell. Starting with you, each player votes for denial or duplication. If denial gets more votes, counter the spell. If duplication gets more votes or the vote is tied, copy the spell. You may choose new targets for the copy.",
  targets: ["instant-or-sorcery-spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", for: { options: ["denial", "duplication"] } },
      {
        kind: "conditional",
        condition: { kind: "vote-won", option: 0 },
        then: { kind: "counter", target: 0 },
        else: { kind: "copy-spell", target: 0, newTargets: true },
      },
    ],
  },
});
