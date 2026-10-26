/**
 * Tempest (TMP), batch 2, group C.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Tahngarth's Rage", () => {
  it("gives -2/-1 off combat and +3/+0 while attacking", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Tahngarth's Rage"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 1 });
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(15);
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 1 });
  });
});

describe("Sarcomancy", () => {
  it("makes a Zombie, and pings you at upkeep only when no player has a Zombie", () => {
    const { game } = table();
    enter(game, "Sarcomancy");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    toStep(game, "draw");
    expect(life(game, A)).toBe(20);
    destroy(game, named(game, "Zombie Token", A)[0]);
    const theirs = spawn(game, "Zombie Token", B);
    toStep(game, "draw");
    expect(life(game, A)).toBe(20);
    destroy(game, theirs);
    toStep(game, "draw");
    expect(life(game, A)).toBe(19);
  });
});

describe("Thalakos Dreamsower", () => {
  it("taps a creature on damage to an opponent, which stays tapped while it does", () => {
    const { game, a } = table();
    const sower = spawn(game, "Thalakos Dreamsower");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    attack(game, a, [sower]);
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[sower].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Unstable Shapeshifter", () => {
  it("becomes a copy of each creature that enters, keeping its ability", () => {
    const { game } = table();
    const shifter = spawn(game, "Unstable Shapeshifter");
    enter(game, "Grizzly Bears", B);
    expect(pt(game, shifter)).toEqual({ power: 2, toughness: 2 });
    enter(game, "Hill Giant", B);
    expect(pt(game, shifter)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Skyshroud Condor", () => {
  it("can be cast only after another spell this turn", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const condor = toHand(game, "Skyshroud Condor");
    expect(() => cast(game, condor, { settle: false })).toThrow();
    cast(game, toHand(game, "Shadowstorm"));
    cast(game, condor);
    expect(zone(game, condor)).toBe("battlefield");
  });
});

describe("Shadowstorm", () => {
  it("deals 2 to each creature with shadow only", () => {
    const { game } = table();
    const horror = spawn(game, "Dauthi Horror", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shadowstorm"));
    expect(zone(game, horror)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Mindwhip Sliver", () => {
  it("gives Slivers a sacrifice ability: target player discards at random", () => {
    const { game } = table();
    const sliver = spawn(game, "Mindwhip Sliver");
    lands(game, "Swamp", 2);
    const before = hand(game, B).length;
    activate(game, sliver, 0, { targets: [ref(B)] });
    expect(zone(game, sliver)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Warmth", () => {
  it("gains 2 when an opponent casts a red spell", () => {
    const { game } = table();
    spawn(game, "Warmth");
    lands(game, "Mountain", 1, B);
    toStep(game, "precombat-main", B);
    cast(game, toHand(game, "Shadowstorm", B), { player: B });
    expect(life(game, A)).toBe(22);
  });
});
