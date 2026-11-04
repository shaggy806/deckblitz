import { defineCard } from "../define.js";

const TEXT =
  "Whenever you activate an ability of an artifact or creature that isn't a mana ability, if one or more permanents were sacrificed to activate it, you may copy that ability. You may choose new targets for the copy. (Sacrificing an artifact for mana to activate an ability doesn't count.)";

// "Sacrificed to activate it" is the ability's own cost (the ruling), so a
// Treasure sacrificed for the mana isn't. The ability is a permanent's as it was
// activated, one that sacrificed itself included (rule 113.7a).
export default defineCard({
  name: "Ashnod the Uncaring",
  manaCost: "{2}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "activates-ability",
        who: "you",
        source: { typesAnyOf: ["artifact", "creature"] },
        sacrificedToActivate: true,
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy that ability?",
        effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
