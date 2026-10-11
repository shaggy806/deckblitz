/**
 * The set walk, batch 56, part a (2026-10-11): Marvel Super Heroes Commander.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Rescue, Pepper Potts", () => {
  it("returns another artifact or creature you control, and grows only if it was an artifact", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [ring]);
    const rescue = enter(game, "Rescue, Pepper Potts");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([ring, bears]));
    expect(seen.offered[0]).not.toContain(rescue);
    expect(seen.offered[0]).not.toContain(theirs);
    expect(zone(game, ring)).toBe("hand");
    expect(counters(game, rescue)).toBe(1);

    // A creature that isn't an artifact: back to hand, no counter.
    pickTargets(a, bears);
    const second = enter(game, "Rescue, Pepper Potts");
    expect(zone(game, bears)).toBe("hand");
    expect(counters(game, second)).toBe(0);
  });
});

describe("Endless Ranks of HYDRA", () => {
  it("makes a Villain for each opponent, and returns from the graveyard when your commander attacks and you pay", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Endless Ranks of HYDRA"));
    expect(tokensNamed(game, "Villain Token", A)).toBe(2);
    const ranks = game.state.zones.perPlayer[A].graveyard.find(
      (id) => game.state.objects[id].cardName === "Endless Ranks of HYDRA",
    ) as ObjectId;
    expect(ranks).toBeDefined();

    lands(game, "Swamp", 2);
    // Something that isn't your commander attacking does nothing.
    const bears = spawn(game, "Grizzly Bears");
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    pickModes(a, 0);
    attack(game, a, [bears, commander], C);
    expect(zone(game, ranks)).toBe("hand");
  });

  it("stays put when the attacker is someone else's commander", () => {
    const { game, a, b } = table();
    const ranks = toGraveyard(game, "Endless Ranks of HYDRA");
    lands(game, "Swamp", 2);
    const theirs = spawn(game, "Hill Giant", B);
    game.state.objects[theirs].isCommander = true;
    pickModes(a, 0);
    toStep(game, "precombat-main", B);
    attack(game, b, [theirs], A);
    expect(zone(game, ranks)).toBe("graveyard");
  });
});

describe("The Thing", () => {
  it("gets four counters at combat after a noncreature spell, then doubles every kind of counter on the chosen permanents", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Sol Ring"));
    for (const land of ["Mountain", "Forest", "Plains", "Island"]) spawn(game, land);
    const thing = spawn(game, "The Thing");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    game.state.objects[bears].counters.charge = 2;
    const skipped = spawn(game, "Hill Giant");
    game.state.objects[skipped].counters["+1/+1"] = 1;
    pickModes(a, 0);
    pickTargets(a, thing, bears);
    attack(game, a, [thing]);
    expect(counters(game, thing)).toBe(8);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, bears, "charge")).toBe(4);
    expect(counters(game, skipped)).toBe(1);
    expect(life(game, B)).toBe(20 - 13);
  });

  it("gets no counters at combat without a noncreature spell", () => {
    const { game, a } = table();
    const thing = spawn(game, "The Thing");
    pickModes(a);
    attack(game, a, [thing]);
    expect(counters(game, thing)).toBe(0);
  });
});

describe("Nova Flame", () => {
  it("puts X counters on your creature, which then deals its new power to each other creature", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Hill Giant");
    const big = spawn(game, "Craw Wurm", B); // 6/4
    cast(game, toHand(game, "Nova Flame"), { targets: [ref(bears)], x: 2 });
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, big)).toBe("graveyard");
  });
});

describe("Invisible Woman", () => {
  it("makes a Wall after a noncreature spell, and a paid attack pumps a creature by your creature count and makes it unblockable", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Sol Ring"));
    for (const land of ["Mountain", "Forest", "Plains", "Island"]) spawn(game, land);
    spawn(game, "Invisible Woman");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Wall Token (Invisible Woman)", A)).toBe(1);
    // Invisible Woman, the Bears and the Wall: +3/+0.
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    expect(life(game, B)).toBe(15);
  });
});

describe("Hulk, Strongest There Is", () => {
  it("enters with a counter and doubles +1/+1 counters on Gamma creatures you control at your upkeep", () => {
    const { game } = table();
    const hulk = enter(game, "Hulk, Strongest There Is");
    expect(counters(game, hulk)).toBe(1);
    const gamma = spawn(game, "Gamma Grotesque");
    game.state.objects[gamma].counters["+1/+1"] = 3;
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    const theirs = spawn(game, "Gamma Grotesque", B);
    game.state.objects[theirs].counters["+1/+1"] = 1;
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, hulk)).toBe(2);
    expect(counters(game, gamma)).toBe(6);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, theirs)).toBe(1);
  });
});

describe("Quicksilver, Speedster", () => {
  it("lets you cast spells at instant speed only while it's tapped", () => {
    const { game } = table();
    const quicksilver = spawn(game, "Quicksilver, Speedster");
    lands(game, "Island", 6);
    toStep(game, "begin-combat");
    const first = toHand(game, "Divination");
    expect(() => cast(game, first)).toThrow();
    game.state.objects[quicksilver].tapped = true;
    cast(game, first);
    expect(zone(game, first)).toBe("graveyard");
  });
});

describe("Klaw, Master of Sound", () => {
  it("exiles the damaged player's top card face down to play, and gains indestructible when you play a card from exile", () => {
    const { game, a } = table();
    const klaw = spawn(game, "Klaw, Master of Sound");
    attack(game, a, [klaw]);
    expect(life(game, B)).toBe(17);
    const stolen = Object.values(game.state.objects).find((o) => o.zone === "exile" && o.owner === B);
    if (stolen === undefined) throw new Error("nothing was exiled");
    expect(keywords(game, klaw).has("indestructible")).toBe(false);
    game.dispatch({ type: "play-land", player: A, card: stolen.id });
    settle(game);
    expect(zone(game, stolen.id)).toBe("battlefield");
    expect(keywords(game, klaw).has("indestructible")).toBe(true);
  });
});

describe("Black Widow, Intel Expert", () => {
  it("has you and the damaged player each draw two", () => {
    const { game, a } = table();
    const widow = spawn(game, "Black Widow, Intel Expert");
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    attack(game, a, [widow]);
    expect(hand(game, A).length).toBe(mine + 2);
    expect(hand(game, B).length).toBe(theirs + 2);
  });
});

describe("Black Widow, Deadly Hunter", () => {
  it("draws and loses 1 life when a creature you control with deathtouch connects, not one without", () => {
    const { game, a } = table();
    const widow = spawn(game, "Black Widow, Deadly Hunter");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    attack(game, a, [widow, bears]);
    expect(hand(game, A).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
  });
});

describe("Hatut Zeraze Strike Force", () => {
  it("copies itself once for each time you've cast your commander from the command zone", () => {
    const { game, a } = table();
    game.state.players[A].commanderCastCounts["Hill Giant"] = 2;
    lands(game, "Plains", 4);
    const ring = spawn(game, "Sol Ring", B);
    const relic = spawn(game, "Mind Stone", B);
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return asked === 1 ? [ref(ring)] : asked === 2 ? [ref(relic)] : [null];
    };
    cast(game, toHand(game, "Hatut Zeraze Strike Force"));
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Hatut Zeraze Strike Force")).toHaveLength(3);
    expect(tokensNamed(game, "Hatut Zeraze Strike Force", A)).toBe(2);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, relic)).toBe("graveyard");
  });
});
