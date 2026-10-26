/**
 * Saviors of Kamigawa (SOK) — group D of the set walk: the Spirit-or-Arcane
 * cast triggers, hand-size counts, soulshift and bushido.
 */
import { describe, expect, it } from "vitest";

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
  keywords,
  lands,
  life,
  pickModes,
  pickPermanents,
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
  zone,
} from "./harness.js";

describe("Nikko-Onna", () => {
  it("destroys an enchantment as it enters, and may return to hand when you cast an Arcane spell", () => {
    const { game, a } = table();
    const aura = spawn(game, "Pacifism", B);
    pickTargets(a, aura);
    const onna = enter(game, "Nikko-Onna");
    expect(zone(game, aura)).toBe("graveyard");
    lands(game, "Island", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Reach Through Mists"));
    expect(zone(game, onna)).toBe("hand");
  });

  it("doesn't trigger on a spell that's neither Spirit nor Arcane", () => {
    const { game, a } = table();
    const onna = spawn(game, "Nikko-Onna");
    lands(game, "Forest", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, onna)).toBe("battlefield");
  });
});

describe("Bounteous Kirin", () => {
  it("may gain life equal to the Spirit spell's mana value", () => {
    const { game, a } = table();
    spawn(game, "Bounteous Kirin");
    lands(game, "Swamp", 4);
    pickModes(a, 0);
    cast(game, toHand(game, "Kami of Empty Graves"));
    expect(life(game)).toBe(24);
  });

  it("declining gains nothing", () => {
    const { game, a } = table();
    spawn(game, "Bounteous Kirin");
    lands(game, "Island", 1);
    pickModes(a);
    cast(game, toHand(game, "Reach Through Mists"));
    expect(life(game)).toBe(20);
  });
});

describe("Briarknit Kami", () => {
  it("puts a +1/+1 counter on target creature when you cast an Arcane spell", () => {
    const { game, a } = table();
    spawn(game, "Briarknit Kami");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    pickTargets(a, bears);
    cast(game, toHand(game, "Reach Through Mists"));
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Seed the Land", () => {
  it("gives the Snake to the entering land's controller", () => {
    const { game } = table();
    spawn(game, "Seed the Land");
    enter(game, "Forest", B);
    expect(tokensNamed(game, "Snake Token", B)).toBe(1);
    expect(tokensNamed(game, "Snake Token", A)).toBe(0);
  });
});

describe("Rending Vines", () => {
  it("destroys only when the mana value is at most your hand size, and draws either way", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    // Eight cards stay in hand as it resolves: a mana value 9 artifact survives.
    const portal = spawn(game, "Portal to Phyrexia", B);
    const vines = toHand(game, "Rending Vines");
    const before = hand(game).length;
    expect(before).toBe(9);
    cast(game, vines, { targets: [ref(portal)] });
    expect(zone(game, portal)).toBe("battlefield");
    expect(hand(game).length).toBe(before);

    const wine = spawn(game, "Wine of Blood and Iron", B);
    cast(game, toHand(game, "Rending Vines"), { targets: [ref(wine)] });
    expect(zone(game, wine)).toBe("graveyard");
  });
});

describe("Oboro Envoy", () => {
  it("gives -X/-0 where X counts the hand after the land returned for the cost", () => {
    const { game, a } = table();
    const envoy = spawn(game, "Oboro Envoy");
    const [island] = lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    pickPermanents(a, island);
    activate(game, envoy, 0, { targets: [ref(bears)] });
    expect(zone(game, island)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
    expect(pt(game, bears).power).toBe(2 - (before + 1));
    expect(pt(game, bears).toughness).toBe(2);
  });
});

describe("Iizuka the Ruthless", () => {
  it("sacrifices a Samurai to give Samurai creatures you control double strike", () => {
    const { game } = table();
    const iizuka = spawn(game, "Iizuka the Ruthless");
    const avenger = spawn(game, "Jade Avenger");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    game.dispatch({ type: "activate-ability", player: A, source: iizuka, abilityIndex: 0, targets: [], sacrifice: avenger });
    settle(game);
    expect(zone(game, avenger)).toBe("graveyard");
    expect(keywords(game, iizuka).has("double-strike")).toBe(true);
    expect(keywords(game, bears).has("double-strike")).toBe(false);
  });

  it("has bushido 2 when it becomes blocked", () => {
    const { game, a, b } = table();
    const iizuka = spawn(game, "Iizuka the Ruthless");
    const wall = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: iizuka }];
    attack(game, a, [iizuka]);
    expect(pt(game, iizuka)).toEqual({ power: 5, toughness: 5 });
    expect(zone(game, iizuka)).toBe("battlefield");
    expect(zone(game, wall)).toBe("graveyard");
  });
});

describe("Wine of Blood and Iron", () => {
  it("doubles a creature's power and is sacrificed at the next end step", () => {
    const { game } = table();
    const wine = spawn(game, "Wine of Blood and Iron");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 4);
    activate(game, wine, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(zone(game, wine)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, wine)).toBe("graveyard");
  });
});

describe("Kiku's Shadow", () => {
  it("has the creature deal damage to itself equal to its power", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Kiku's Shadow"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Kami of Empty Graves", () => {
  it("soulshift 3 returns a Spirit card with mana value 3 or less", () => {
    const { game, a } = table();
    const kami = spawn(game, "Kami of Empty Graves");
    const onna = toGraveyard(game, "Nikko-Onna");
    const kirin = toGraveyard(game, "Bounteous Kirin");
    pickModes(a, 0);
    pickTargets(a, onna);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Kiku's Shadow"), { targets: [ref(kami)] });
    expect(zone(game, kami)).toBe("graveyard");
    expect(zone(game, onna)).toBe("hand");
    expect(graveyard(game)).toContain(kirin);
  });
});

describe("Skull Collector", () => {
  it("returns a black creature you control at your upkeep", () => {
    const { game, a } = table();
    const collector = spawn(game, "Skull Collector");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, collector);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, collector)).toBe("hand");
    expect(zone(game, bears)).toBe("battlefield");
  });
});
