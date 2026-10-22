/**
 * Amonkhet, group L: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Open into Wonder", () => {
  it("X target creatures each draw a card on combat damage this turn", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const [x, y] = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    cast(game, toHand(game, "Open into Wonder"), { x: 2, targets: [ref(x), ref(y)] });
    const before = hand(game).length;
    attack(game, a, [x, y]);
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, B)).toBe(16);
  });
});

describe("Aven Wind Guide", () => {
  it("gives creature tokens you control flying and vigilance", () => {
    const { game } = table();
    spawn(game, "Aven Wind Guide");
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Start // Finish"), { face: 1 });
    const token = named(game, "Warrior Token (Vigilance)", A)[0];
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, token).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});

describe("Winds of Rebuke", () => {
  it("bounces the target and each player mills two", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Winds of Rebuke"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(graveyard(game, B).length).toBe(2);
    expect(graveyard(game, A).length).toBe(3);
  });
});

describe("Bounty of the Luxa", () => {
  it("draws and adds a flood counter with none, then removes it for {C}{G}{U}", () => {
    const { game } = table();
    const bounty = spawn(game, "Bounty of the Luxa");
    toStep(game, "upkeep");
    settle(game);
    let before = hand(game).length;
    toStep(game, "precombat-main");
    settle(game);
    expect(hand(game).length).toBe(before + 2);
    expect(counters(game, bounty, "flood")).toBe(1);
    toStep(game, "upkeep");
    settle(game);
    before = hand(game).length;
    toStep(game, "precombat-main");
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, bounty, "flood")).toBe(0);
    expect(game.state.players[A].manaPool.map((u) => u.type).sort()).toEqual(["C", "G", "U"]);
  });
});

describe("Oracle's Vault", () => {
  it("the first ability lets you play the card and adds a brick counter", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const vault = spawn(game, "Oracle's Vault");
    const bears = toLibrary(game, "Grizzly Bears");
    activate(game, vault, 0);
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, vault, "brick")).toBe(1);
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("the second needs three bricks, and the card is free", () => {
    const { game } = table();
    const vault = spawn(game, "Oracle's Vault");
    game.state.objects[vault].counters.brick = 2;
    expect(() => activate(game, vault, 1)).toThrow();
    game.state.objects[vault].counters.brick = 3;
    const bears = toLibrary(game, "Grizzly Bears");
    activate(game, vault, 1);
    cast(game, bears, { via: "impulse", free: true });
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Heaven // Earth", () => {
  it("Heaven hits fliers, Earth from the graveyard hits the rest, each with its own X", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Mountain", 4);
    const birds = spawn(game, "Birds of Paradise", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Heaven // Earth");
    cast(game, card, { face: 1, x: 1 });
    expect([zone(game, birds), zone(game, bears)]).toEqual(["graveyard", "battlefield"]);
    cast(game, card, { face: 2, via: "aftermath", x: 2 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Splendid Agony", () => {
  it("two targets get one -1/-1 counter each", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const [x, y] = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    cast(game, toHand(game, "Splendid Agony"), { targets: [ref(x), ref(y)] });
    expect([counters(game, x, "-1/-1"), counters(game, y, "-1/-1")]).toEqual([1, 1]);
  });
});

describe("Lay Claim", () => {
  it("takes any permanent, not only a creature", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Lay Claim"), { targets: [ref(ring)] });
    expect(controller(game, ring)).toBe(A);
  });
});

describe("Heart-Piercer Manticore", () => {
  it("sacrificing another creature deals its power to the target", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    pickModes(a, 0);
    pickTargets(a, B);
    const manticore = enter(game, "Heart-Piercer Manticore");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, manticore)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
  });
});

describe("Consuming Fervor", () => {
  it("+3/+3, and a -1/-1 counter at its controller's upkeep", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Consuming Fervor"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Trial of Knowledge", () => {
  it("returns to hand when a Cartouche you control enters", () => {
    const { game } = table();
    const before = hand(game).length;
    const trial = enter(game, "Trial of Knowledge");
    expect(hand(game).length).toBe(before + 2);
    toStep(game, "precombat-main");
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Cartouche of Solidarity"), { targets: [ref(bears)] });
    expect(zone(game, trial)).toBe("hand");
  });
});

describe("Start // Finish", () => {
  it("Start makes two Warriors; Finish sacrifices a creature and destroys the target", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Swamp", 3);
    const card = toHand(game, "Start // Finish");
    cast(game, card, { face: 1 });
    expect(tokensNamed(game, "Warrior Token (Vigilance)", A)).toBe(2);
    const fodder = spawn(game, "Grizzly Bears");
    const enemy = spawn(game, "Hill Giant", B);
    cast(game, card, { face: 2, via: "aftermath", targets: [ref(enemy)], sacrifice: fodder });
    expect([zone(game, fodder), zone(game, enemy), zone(game, card)]).toEqual(["graveyard", "graveyard", "exile"]);
  });
});

describe("Devoted Crop-Mate", () => {
  it("exerted, returns a creature card with mana value 2 or less", () => {
    const { game, a } = table();
    const mate = spawn(game, "Devoted Crop-Mate");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    attack(game, a, [mate]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
  });
});

describe("Shed Weakness", () => {
  it("+2/+2 and may remove a -1/-1 counter", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["-1/-1"] = 1;
    pickModes(a, 0);
    cast(game, toHand(game, "Shed Weakness"), { targets: [ref(bears)] });
    expect(counters(game, bears, "-1/-1")).toBe(0);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Hooded Brawler", () => {
  it("exerted, gets +2/+2", () => {
    const { game, a } = table();
    const brawler = spawn(game, "Hooded Brawler");
    pickModes(a, 0);
    attack(game, a, [brawler]);
    expect(life(game, B)).toBe(15);
  });
});

describe("Supply Caravan", () => {
  it("makes a Warrior only if you control a tapped creature", () => {
    const { game } = table();
    enter(game, "Supply Caravan");
    expect(tokensNamed(game, "Warrior Token (Vigilance)", A)).toBe(0);
    spawn(game, "Grizzly Bears", A, { tapped: true });
    enter(game, "Supply Caravan");
    expect(tokensNamed(game, "Warrior Token (Vigilance)", A)).toBe(1);
  });
});
