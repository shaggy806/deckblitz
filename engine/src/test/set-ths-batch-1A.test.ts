/**
 * Theros and Commander 2013, group A: a tempting offer of copies, Daxos's
 * exile-and-gain, Time to Feed's delayed life, Hythonia's monstrous wrath,
 * Shattergang Brothers' symmetric sacrifice and Chained to the Rocks.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  toLibrary,
  zone,
} from "./harness.js";

describe("Tempt with Reflections", () => {
  it("an opponent who accepts gets a copy and gives you one more", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 4);
    pickModes(b, 0);
    cast(game, toHand(game, "Tempt with Reflections"), { targets: [ref(bears)] });
    expect([tokensNamed(game, "Grizzly Bears", A), tokensNamed(game, "Grizzly Bears", B)]).toEqual([2, 1]);
    expect(tokensNamed(game, "Grizzly Bears", B)).toBe(1);
  });

  it("an opponent who declines leaves you with one copy", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 4);
    pickModes(b);
    cast(game, toHand(game, "Tempt with Reflections"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    expect(tokensNamed(game, "Grizzly Bears", B)).toBe(0);
  });
});

describe("Daxos of Meletis", () => {
  it("exiles the top card, gains life equal to its mana value, and lets you cast it with any mana", () => {
    const { game, a } = table();
    const daxos = spawn(game, "Daxos of Meletis");
    const top = toLibrary(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    attack(game, a, [daxos]);
    expect(zone(game, top)).toBe("exile");
    expect(life(game, A)).toBe(22);
    // Two Plains pay {1}{G}: any-colour spending, this turn only.
    expect(game.legalActions(A).filter((x) => x.kind === "cast-spell" && x.card === top)).toHaveLength(1);
  });
});

describe("Time to Feed", () => {
  it("you gain 3 life when the opponent's creature dies to the fight", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Llanowar Elves", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Time to Feed"), { targets: [ref(theirs), ref(mine)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(life(game, A)).toBe(23);
  });
});

describe("Hythonia the Cruel", () => {
  it("becoming monstrous destroys every non-Gorgon creature", () => {
    const { game } = table();
    const hythonia = spawn(game, "Hythonia the Cruel");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 8);
    activate(game, hythonia, 0);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, hythonia)).toBe("battlefield");
  });
});

describe("Shattergang Brothers", () => {
  it("sacrificing an artifact makes each other player sacrifice an artifact", () => {
    const { game } = table();
    const brothers = spawn(game, "Shattergang Brothers");
    const mine = spawn(game, "Ornithopter");
    const theirs = spawn(game, "Ornithopter", B);
    lands(game, "Mountain", 3);
    game.dispatch({ type: "activate-ability", player: A, source: brothers, abilityIndex: 1, targets: [], sacrifice: mine });
    settle(game);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Cavalry Pegasus", () => {
  it("gives attacking Humans flying", () => {
    const { game, a } = table();
    const pegasus = spawn(game, "Cavalry Pegasus");
    const human = spawn(game, "Elite Vanguard");
    const home = spawn(game, "Elite Vanguard");
    attack(game, a, [pegasus, human]);
    expect(keywords(game, human).has("flying")).toBe(true);
    expect(keywords(game, home).has("flying")).toBe(false);
  });
});

describe("Chained to the Rocks", () => {
  it("exiles an opponent's creature until it leaves", () => {
    const { game, a } = table();
    const mountain = spawn(game, "Mountain");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    pickTargets(a, theirs);
    const chained = toHand(game, "Chained to the Rocks");
    cast(game, chained, { targets: [ref(mountain)] });
    expect(zone(game, theirs)).toBe("exile");
    destroy(game, chained);
    expect(named(game, "Grizzly Bears", B).some((id) => zone(game, id) === "battlefield")).toBe(true);
  });
});
