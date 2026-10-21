/**
 * Commander 2019 and Core Set 2020 (C19, M20; B121), group D. One test per
 * card whose behaviour is more than a stat line, on the clause most likely to
 * be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Backdraft Hellkite", () => {
  it("attacking gives the instants in your graveyard flashback", () => {
    const { game, a } = table();
    const hellkite = spawn(game, "Backdraft Hellkite");
    const shock = toGraveyard(game, "Shock");
    lands(game, "Mountain", 1);
    const before = game.legalActions(A).some((l) => l.kind === "cast-spell" && l.card === shock);
    expect(before).toBe(false);
    attack(game, a, [hellkite]);
    const offer = game.legalActions(A).find((l) => l.kind === "cast-spell" && l.card === shock);
    expect(offer).toBeDefined();
  });
});

describe("Flame Sweep", () => {
  it("spares only creatures you control with flying", () => {
    const { game } = table();
    const myDrake = spawn(game, "Wind Drake");
    const myBears = spawn(game, "Grizzly Bears");
    const theirDrake = spawn(game, "Wind Drake", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Flame Sweep"));
    expect(zone(game, myDrake)).toBe("battlefield");
    expect(zone(game, myBears)).toBe("graveyard");
    expect(zone(game, theirDrake)).toBe("graveyard");
  });
});

describe("Doomed Artisan", () => {
  it("makes Sculptures that count each other and can't attack", () => {
    const { game } = table();
    spawn(game, "Doomed Artisan");
    nextTurn(game);
    const [first] = named(game, "Sculpture Token", A);
    expect(first).toBeDefined();
    expect(pt(game, first)).toEqual({ power: 1, toughness: 1 });
    nextTurn(game);
    nextTurn(game);
    expect(tokensNamed(game, "Sculpture Token", A)).toBe(2);
    expect(pt(game, first)).toEqual({ power: 2, toughness: 2 });
    const restrictions = computeCharacteristics(game.state, registryOf(game), first).restrictions;
    expect(restrictions.has("cant-attack")).toBe(true);
    expect(restrictions.has("cant-block")).toBe(true);
  });
});

describe("Masterful Replication", () => {
  it("turns each other artifact you control into a copy of the target", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    const stone = spawn(game, "Mind Stone");
    const theirs = spawn(game, "Mind Stone", B);
    lands(game, "Island", 6);
    cast(game, toHand(game, "Masterful Replication"), { modes: [1], targets: [ref(ring)] });
    expect(printedCardName(game.state.objects[stone])).toBe("Sol Ring");
    expect(printedCardName(game.state.objects[ring])).toBe("Sol Ring");
    expect(printedCardName(game.state.objects[theirs])).toBe("Mind Stone");
  });

  it("or makes two Golems", () => {
    const { game } = table();
    lands(game, "Island", 6);
    cast(game, toHand(game, "Masterful Replication"), { modes: [0] });
    expect(tokensNamed(game, "Golem Token", A)).toBe(2);
  });
});

describe("Skyfire Phoenix", () => {
  it("returns from the graveyard when you cast your commander", () => {
    const { game } = table();
    const phoenix = toGraveyard(game, "Skyfire Phoenix");
    const plain = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    cast(game, plain);
    expect(zone(game, phoenix)).toBe("graveyard");
    const commander = toHand(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    cast(game, commander);
    expect(zone(game, phoenix)).toBe("battlefield");
  });
});

describe("Thalia's Geistcaller", () => {
  it("makes a Spirit when you cast a spell from your graveyard", () => {
    const { game } = table();
    spawn(game, "Thalia's Geistcaller");
    lands(game, "Island", 5);
    cast(game, toHand(game, "Think Twice"));
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
    const think = graveyard(game).find((id) => game.state.objects[id].cardName === "Think Twice")!;
    const flashback = game.legalActions(A).find((l) => l.kind === "cast-spell" && l.card === think);
    if (flashback?.kind !== "cast-spell") throw new Error("no flashback offered");
    cast(game, think, { via: flashback.via });
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });
});

describe("Gorging Vulture", () => {
  it("gains 1 life per creature card milled", () => {
    const { game } = table();
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Grizzly Bears");
    enter(game, "Gorging Vulture");
    expect(life(game)).toBe(22);
  });
});

describe("Scholar of the Ages", () => {
  it("returns two instant or sorcery cards", () => {
    const { game, a } = table();
    const shock = toGraveyard(game, "Shock");
    const think = toGraveyard(game, "Think Twice");
    pickTargets(a, shock, think);
    enter(game, "Scholar of the Ages");
    expect(zone(game, shock)).toBe("hand");
    expect(zone(game, think)).toBe("hand");
  });
});

describe("Bloodsoaked Altar", () => {
  it("pays life, a card and a creature for a 5/5 flying Demon", () => {
    const { game } = table();
    const altar = spawn(game, "Bloodsoaked Altar");
    const bears = spawn(game, "Grizzly Bears");
    const handBefore = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: altar, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game)).toBe(18);
    expect(hand(game).length).toBe(handBefore - 1);
    expect(tokensNamed(game, "5/5 Demon Token", A)).toBe(1);
  });
});

describe("Wildfire Elemental", () => {
  it("pumps your creatures when an opponent is dealt noncombat damage", () => {
    const { game } = table();
    const elemental = spawn(game, "Wildfire Elemental");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(pt(game, elemental)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Lavakin Brawler", () => {
  it("gets +1/+0 per Elemental you control as it attacks", () => {
    const { game, a } = table();
    const brawler = spawn(game, "Lavakin Brawler");
    spawn(game, "Waterkin Shaman");
    attack(game, a, [brawler]);
    expect(pt(game, brawler)).toEqual({ power: 4, toughness: 4 });
    expect(life(game, B)).toBe(16);
  });
});

describe("Goblin Smuggler", () => {
  it("makes another small creature, even an opponent's, unblockable", () => {
    const { game } = table();
    const smuggler = spawn(game, "Goblin Smuggler");
    const theirs = spawn(game, "Grizzly Bears", B);
    activate(game, smuggler, 0, { targets: [ref(theirs)] });
    const kws = computeCharacteristics(game.state, registryOf(game), theirs).keywords;
    expect(kws.has("unblockable")).toBe(true);
  });
});

describe("Tomebound Lich", () => {
  it("loots as it enters", () => {
    const { game } = table();
    const before = hand(game).length;
    const gyBefore = graveyard(game).length;
    enter(game, "Tomebound Lich");
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(gyBefore + 1);
  });
});

describe("Savage Gorger", () => {
  it("grows at your end step only if an opponent lost life", () => {
    const { game } = table();
    const gorger = spawn(game, "Savage Gorger");
    nextTurn(game);
    expect(counters(game, gorger)).toBe(0);
    nextTurn(game);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    nextTurn(game);
    expect(counters(game, gorger)).toBe(1);
  });
});

describe("Waterkin Shaman", () => {
  it("gets +1/+1 when a creature you control with flying enters", () => {
    const { game } = table();
    const shaman = spawn(game, "Waterkin Shaman");
    enter(game, "Grizzly Bears");
    expect(pt(game, shaman)).toEqual({ power: 2, toughness: 1 });
    enter(game, "Wind Drake");
    expect(pt(game, shaman)).toEqual({ power: 3, toughness: 2 });
  });
});
