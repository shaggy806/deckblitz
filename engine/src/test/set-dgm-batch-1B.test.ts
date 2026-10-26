import { describe, expect, it } from "vitest";
import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  spawn,
  tokensNamed,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Dragon's Maze, group B", () => {
  it("Sire of Insanity: each player discards their hand at each end step", () => {
    const { game } = table();
    spawn(game, "Sire of Insanity", A);
    expect(hand(game, A).length).toBeGreaterThan(0);
    expect(hand(game, B).length).toBeGreaterThan(0);
    toStep(game, "cleanup");
    expect(hand(game, A).length).toBe(0);
    expect(hand(game, B).length).toBe(0);
  });

  it("Savageborn Hydra: enters with X +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const hydra = toHand(game, "Savageborn Hydra");
    cast(game, hydra, { x: 2 });
    expect(zone(game, hydra)).toBe("battlefield");
    expect(counters(game, hydra)).toBe(2);
    expect(pt(game, hydra)).toEqual({ power: 2, toughness: 2 });
  });

  it("Drown in Filth: mills four, then -1/-1 per land card in your graveyard (the milled ones included)", () => {
    const { game } = table();
    toGraveyard(game, "Wastes", A);
    toGraveyard(game, "Opt", A);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Drown in Filth"), { targets: [ref(dreadmaw)] });
    // One Wastes before, four milled Wastes: -5/-5 on a 6/6.
    expect(pt(game, dreadmaw)).toEqual({ power: 1, toughness: 1 });
  });

  it("Carnage Gladiator: a blocking creature's controller loses 1 life", () => {
    const { game, a, b } = table();
    spawn(game, "Carnage Gladiator", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });

  it("Sinister Possession: the enchanted creature's controller loses 2 when it blocks", () => {
    const { game, a, b } = table();
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Sinister Possession"), { targets: [ref(blocker)] });
    const bears = spawn(game, "Grizzly Bears", A);
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("Morgue Burst: returns the creature card and deals its power to any target", () => {
    const { game } = table();
    const wurm = toGraveyard(game, "Craw Wurm", A);
    lands(game, "Swamp", 4);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Morgue Burst"), { targets: [ref(wurm), ref(B)] });
    expect(zone(game, wurm)).toBe("hand");
    expect(life(game, B)).toBe(14);
  });

  it("Uncovered Clues: only instants and sorceries are offered, up to two", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const opt = toLibrary(game, "Opt");
    const divination = toLibrary(game, "Divination");
    toLibrary(game, "Wastes");
    lands(game, "Island", 3);
    const asked: (readonly string[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      asked.push(eligible);
      // The first ask is the pick; after it, the order the rest go to the bottom in.
      return asked.length === 1 ? eligible.filter((id) => id === opt || id === divination) : eligible;
    };
    cast(game, toHand(game, "Uncovered Clues"));
    expect([...asked[0]].sort()).toEqual([opt, divination].sort());
    expect(zone(game, opt)).toBe("hand");
    expect(zone(game, divination)).toBe("hand");
    expect(zone(game, bears)).toBe("library");
    expect(graveyard(game, A).length).toBe(1); // just the sorcery itself
  });

  it("Maze Glider: multicolored creatures you control have flying, others don't", () => {
    const { game } = table();
    spawn(game, "Maze Glider", A);
    const recruit = spawn(game, "Boros Recruit", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Boros Recruit", B);
    expect(keywords(game, recruit).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(keywords(game, theirs).has("flying")).toBe(false);
  });

  it("Sunspire Gatekeepers: a Knight only with two or more Gates", () => {
    const { game } = table();
    spawn(game, "Azorius Guildgate", A);
    enter(game, "Sunspire Gatekeepers", A);
    expect(tokensNamed(game, "Knight Token", A)).toBe(0);
    spawn(game, "Azorius Guildgate", A);
    enter(game, "Sunspire Gatekeepers", A);
    expect(tokensNamed(game, "Knight Token", A)).toBe(1);
  });

  it("Ubul Sar Gatekeepers: -2/-2 with two Gates", () => {
    const { game, a } = table();
    lands(game, "Azorius Guildgate", 2);
    const bears = spawn(game, "Colossal Dreadmaw", B);
    pickTargets(a, bears);
    enter(game, "Ubul Sar Gatekeepers", A);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});
