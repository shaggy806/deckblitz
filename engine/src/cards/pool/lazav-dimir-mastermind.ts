import { defineCard } from "../define.js";

// EDHREC rank 6952.
//
// Lazav copies the creature *card* — what's printed on it, as it last
// existed in that graveyard if it has left since — never the permanent it
// was: a Clone that died makes him a 0/0 (the ruling). No duration (rule
// 611.2a); his name, legendary, hexproof and this ability are copiable
// exceptions (rule 707.9a-b). He's already on the battlefield, so no
// "enters" ability of the card triggers (rule 707.4). Tokens aren't cards,
// so one dying doesn't trigger him.
const TEXT =
  "Whenever a creature card is put into an opponent's graveyard from anywhere, you may have Lazav become a copy of that card, except its name is Lazav, Dimir Mastermind, it's legendary in addition to its other types, and it has hexproof and this ability.";

export default defineCard({
  name: "Lazav, Dimir Mastermind",
  manaCost: "{U}{U}{B}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  keywords: ["hexproof"],
  text: `Hexproof\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Lazav become a copy of that card?",
        effect: {
          kind: "become-copy",
          target: "source",
          of: "trigger-object",
          ofCard: true,
          exceptions: {
            name: "Lazav, Dimir Mastermind",
            addSupertypes: ["legendary"],
            keywords: ["hexproof"],
            thisAbility: { card: "Lazav, Dimir Mastermind", triggered: 0 },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
