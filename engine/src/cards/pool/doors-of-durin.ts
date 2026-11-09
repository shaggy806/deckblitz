import { defineCard } from "../define.js";

// EDHREC rank 5084. Elven Farsight's scry-then-reveal, then put onto the
// battlefield tapped and attacking; the conditions read after it enters, so a
// Dwarf or Elf put in counts (the ruling).

const TEXT =
  "Whenever you attack, scry 2, then you may reveal the top card of your library. If a creature card is revealed this way, put it onto the battlefield tapped and attacking. Until your next turn, it gains trample if you control a Dwarf and hexproof if you control an Elf.";

export default defineCard({
  name: "Doors of Durin",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "scry",
        amount: 2,
        then: {
          kind: "may",
          prompt: "Reveal the top card of your library?",
          effect: {
            kind: "reveal-top",
            then: {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { type: "creature" } },
              then: {
                kind: "sequence",
                effects: [
                  { kind: "put-onto-battlefield", target: 0, enterTapped: true, attacking: "choose" },
                  {
                    kind: "conditional",
                    condition: { kind: "controls", filter: { subtype: "Dwarf" }, atLeast: 1 },
                    then: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "until-your-next-turn" },
                  },
                  {
                    kind: "conditional",
                    condition: { kind: "controls", filter: { subtype: "Elf" }, atLeast: 1 },
                    then: { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "until-your-next-turn" },
                  },
                ],
              },
            },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
