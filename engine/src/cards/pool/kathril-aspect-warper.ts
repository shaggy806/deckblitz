import { defineCard } from "../define.js";

// Commander 2020 (C20). Top-1000 commander #739. EDHREC rank 15081.
//
// Rulings:
//   Once Kathril's ability begins resolving, no player may take other actions until it's done
//     and you've put +1/+1 counters on Kathril.
//   For each applicable keyword, the appropriate counter may be put on any creature you control,
//     including Kathril. The counters don't need to all be put on the same creature.
//   You check once for each keyword. If you have two creature cards with flying in your
//     graveyard, you put just one flying counter on a creature you control, not two.
//   If cards in your graveyard have multiple hexproof abilities (such as hexproof, hexproof from
//     white, and hexproof from black), a counter of each variant kind will be put onto a creature.
//
// `keyword-counters`: one counter of each listed keyword a creature card in your graveyard has,
// each on a creature you control chosen for it (not a target), a "hexproof from [quality]"
// ability among them a counter of that variant kind (rule 122.1b). The +1/+1 counters are the
// counters that went on (`thisWay: "counters-placed"`).
const TEXT =
  "When Kathril enters, put a flying counter on any creature you control if a creature card in your graveyard has flying. Repeat this process for first strike, double strike, deathtouch, hexproof, indestructible, lifelink, menace, reach, trample, and vigilance. Then put a +1/+1 counter on Kathril for each counter put on a creature this way.";

export default defineCard({
  name: "Kathril, Aspect Warper",
  manaCost: "{2}{W}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Nightmare", "Insect"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "keyword-counters",
            from: { type: "creature" },
            inGraveyard: true,
            keywords: [
              "flying",
              "first-strike",
              "double-strike",
              "deathtouch",
              "hexproof",
              "indestructible",
              "lifelink",
              "menace",
              "reach",
              "trample",
              "vigilance",
            ],
            onto: { type: "creature", controlledBy: "you" },
          },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { thisWay: "counters-placed" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
